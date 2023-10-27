const { parse: parseUrl } = require('node:url')
const crypto = require('node:crypto')
const util = require('node:util')

const { Issuer, generators, custom } = require('openid-client')
const got = require('got')

const { scoped: getLogger } = require('../../../debug')

custom.setHttpOptionsDefaults({ timeout: 15000 })

const generateKeyPair = util.promisify(crypto.generateKeyPair)
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
  const jarm = variant.fapi_response_mode === 'jarm'
  const jar = variant.fapi_request_method === 'signed_non_repudiation'
  const mtls = variant.client_auth_type !== 'private_key_jwt' || variant.sender_constrain === 'mtls'
  const DPoP =
    variant.sender_constrain === 'dpop'
      ? (await generateKeyPair('ec', { namedCurve: 'P-256' })).privateKey
      : undefined

  const response_type = 'code'

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

  const senderConstrain =
    variant.sender_constrain === 'mtls'
      ? { tls_client_certificate_bound_access_tokens: true }
      : { dpop_bound_access_tokens: true }

  //_
  const clientMetadata = {
    token_endpoint_auth_method,
    id_token_signed_response_alg: 'PS256',
    request_object_signing_alg: 'PS256',
    token_endpoint_auth_signing_alg: 'PS256',
    authorization_signed_response_alg: 'PS256',
    ...metadata,
    ...senderConstrain,
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

  const client = new issuer.FAPI2Client(clientMetadata, metadata.jwks)

  log('client', json(client.metadata))

  client[custom.clock_tolerance] = 5

  if (mtls) {
    client[custom.http_options] = (url, options) => {
      log('client is making a request to', url.href)

      if (
        urlIsEqual(url, issuer.token_endpoint) ||
        urlIsEqual(url, issuer.mtls_endpoint_aliases?.token_endpoint) ||
        urlIsEqual(url, issuer.pushed_authorization_request_endpoint) ||
        urlIsEqual(url, issuer.mtls_endpoint_aliases?.pushed_authorization_request_endpoint) ||
        urlIsEqual(url, issuer.userinfo_endpoint) ||
        urlIsEqual(url, issuer.mtls_endpoint_aliases?.userinfo_endpoint) ||
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
  }

  const codeVerifier = generators.codeVerifier()
  let authorizationParams = {
    redirect_uri: client.redirect_uris[0],
    scope,
    response_type,
    code_challenge_method: 'S256',
    code_challenge: generators.codeChallenge(codeVerifier),
    ...params,
  }

  Object.entries(authorizationParams).forEach((key, value) => {
    if (value === null || value === undefined || value === '') {
      delete authorizationParams[key]
    }
  })

  const { redirect_uri } = authorizationParams

  if (jar) {
    authorizationParams = {
      request: await client.requestObject(authorizationParams),
    }
  }

  async function handleUseDpopNonce(p) {
    try {
      return await p()
    } catch (err) {
      if (err.error === 'use_dpop_nonce') {
        log('use_dpop_nonce returned, retrying with a fresh nonce')
        return await p()
      } else {
        throw err
      }
    }
  }

  log('making a Pushed Authorization Request', json(authorizationParams))
  const { request_uri } = await handleUseDpopNonce(() =>
    client.pushedAuthorizationRequest(authorizationParams, { DPoP }),
  )
  const url = client.authorizationUrl({
    request_uri,
    scope: null,
    response_type: null,
    redirect_uri: null,
  })

  log('redirecting to authorization_endpoint', url)
  const authorization = await got.get(url, { followRedirect: false })

  const {
    headers: { location },
  } = authorization
  const { query: callbackParams } = parseUrl(location.replace('#', '?'), true)
  log('got a callback', json({ ...callbackParams }))

  const tokens = await handleUseDpopNonce(() =>
    client[oauthCallback ? 'oauthCallback' : 'callback'](
      redirect_uri,
      callbackParams,
      { response_type, jarm, code_verifier: codeVerifier },
      { DPoP },
    ),
  ).catch((error) => {
    console.log(error)
    log('failed to process callback:', error.message)
    throw error
  })
  log('processed callback', json(tokens))
  let userinfo
  if (!oauthCallback) {
    userinfo = await handleUseDpopNonce(() => client.userinfo(tokens, { DPoP }))
    log('userinfo endpoint response', json(userinfo))
  }
  const resource = await handleUseDpopNonce(() =>
    client.requestResource(accounts_endpoint, tokens, { DPoP }),
  )
  log('resource endpoint response', json(JSON.parse(resource.body)))

  let claims
  if (tokens?.id_token) {
    claims = tokens.claims()
    log('ID Token claims', json(claims))
  }

  return { tokens, resource, claims, userinfo }
}

module.exports = greenPath
