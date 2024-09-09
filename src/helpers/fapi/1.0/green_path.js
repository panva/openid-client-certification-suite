const { parse: parseUrl } = require('node:url')
const crypto = require('node:crypto')

const { Issuer, generators, custom } = require('openid-client')
const got = require('got')

const { scoped: getLogger } = require('../../../debug')

custom.setHttpOptionsDefaults({ timeout: 15000 })

const json = (obj) => JSON.stringify(obj, null, 4)

function urlIsEqual(a, b) {
  try {
    return new URL(a).href === new URL(b).href
  } catch {
    return false
  }
}

async function greenPath({
  moduleId,
  issuer: identifier,
  accounts_endpoint,
  variant,
  params,
  metadata: { certificate, scope, ...metadata },
}) {
  const log = getLogger(moduleId)
  const par = variant.fapi_auth_request_method === 'pushed'
  const pkce = par === true
  const jarm = variant.fapi_response_mode === 'jarm'

  let response_type = 'code id_token'

  if (jarm) {
    response_type = 'code'
  }

  const oauthCallback = variant.fapi_client_type === 'plain_oauth'

  let token_endpoint_auth_method
  switch (variant.client_auth_type) {
    case 'mtls':
      token_endpoint_auth_method = 'self_signed_tls_client_auth'
      break
    case 'private_key_jwt':
      token_endpoint_auth_method = 'private_key_jwt'
      break
    default:
      throw new Error('invalid client_auth_type variant')
  }

  const privateKey = crypto.createPrivateKey({ format: 'jwk', key: metadata.jwks.keys[0] })

  const clientMetadata = {
    token_endpoint_auth_method,
    response_types: [response_type],
    id_token_signed_response_alg: 'PS256',
    request_object_signing_alg: 'PS256',
    token_endpoint_auth_signing_alg: 'PS256',
    authorization_signed_response_alg: 'PS256',
    tls_client_certificate_bound_access_tokens: true,
    grant_types: [
      ...response_type.split(' ').reduce((acc, type) => {
        switch (type) {
          case 'code':
            acc.add('authorization_code')
            break
          case 'id_token':
          case 'token':
            acc.add('implicit')
            break
          default:
        }
        return acc
      }, new Set()),
    ],
    ...metadata,
    jwks: {
      keys: [
        {
          ...metadata.jwks.keys[0],
          d: undefined,
          p: undefined,
          q: undefined,
          dp: undefined,
          dq: undefined,
          qi: undefined,
        },
      ],
    },
  }

  const issuer = await Issuer.discover(identifier)

  log('discovered issuer', json(issuer.metadata))
  log('accounts_endpoint', accounts_endpoint)

  const client = new issuer.FAPI1Client(clientMetadata, metadata.jwks)

  log('client', json(client.metadata))

  client[custom.clock_tolerance] = 5
  client[custom.http_options] = (url, options) => {
    log('client is making a request to', url.href)

    if (
      urlIsEqual(url, issuer.token_endpoint) ||
      urlIsEqual(url, issuer.mtls_endpoint_aliases?.token_endpoint) ||
      urlIsEqual(url, issuer.pushed_authorization_request_endpoint) ||
      urlIsEqual(url, issuer.mtls_endpoint_aliases?.pushed_authorization_request_endpoint) ||
      urlIsEqual(url, accounts_endpoint)
    ) {
      log('adding mTLS key and certificate')
      return {
        key: privateKey.export({ format: 'pem', type: 'pkcs8' }),
        cert: certificate,
      }
    }

    return {}
  }

  const codeVerifier = pkce ? generators.codeVerifier() : undefined
  let authorizationParams = {
    redirect_uri: client.redirect_uris[0],
    scope,
    response_type,
    state: generators.state(),
    nonce: oauthCallback ? undefined : generators.nonce(),
    claims: oauthCallback
      ? undefined
      : {
          id_token: {
            acr: {
              essential: true,
              values: ['urn:openbanking:psd2:sca', 'urn:openbanking:psd2:ca'],
            },
          },
        },
    ...(pkce
      ? {
          code_challenge_method: 'S256',
          code_challenge: generators.codeChallenge(codeVerifier),
        }
      : undefined),
    ...params,
  }

  Object.entries(authorizationParams).forEach((key, value) => {
    if (value === null || value === undefined || value === '') {
      delete authorizationParams[key]
    }
  })

  const { state, nonce, redirect_uri } = authorizationParams

  const requestObject = await client.requestObject(authorizationParams)
  authorizationParams = {
    state: authorizationParams.state,
    nonce: authorizationParams.nonce,
    request: requestObject,
  }

  let url
  if (par) {
    const parParams = { request: requestObject }
    log('making a Pushed Authorization Request', json(parParams))
    const { request_uri } = await client.pushedAuthorizationRequest(parParams)
    url = client.authorizationUrl({
      request_uri,
      scope: null,
      response_type: null,
      redirect_uri: null,
    })
  } else {
    url = client.authorizationUrl(authorizationParams)
  }

  log('redirecting to authorization_endpoint', url)
  const authorization = await got.get(url, { followRedirect: false })

  const {
    headers: { location },
  } = authorization
  const { query: callbackParams } = parseUrl(location.replace('#', '?'), true)
  log('got a callback', json({ ...callbackParams }))

  const tokens = await client[oauthCallback ? 'oauthCallback' : 'callback'](
    redirect_uri,
    callbackParams,
    { response_type, nonce, state, jarm, code_verifier: codeVerifier },
  ).catch((error) => {
    log('failed to process callback:', error.message)
    throw error
  })
  log('processed callback', json(tokens))
  const resource = await client.requestResource(accounts_endpoint, tokens)
  log('resource endpoint response', json(JSON.parse(resource.body)))

  let claims
  if (tokens?.id_token) {
    claims = tokens.claims()
    log('ID Token claims', json(claims))
  }

  return { tokens, resource, claims }
}

module.exports = greenPath
