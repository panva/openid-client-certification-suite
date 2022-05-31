/* eslint-disable camelcase */

const { parse: parseUrl } = require('url') // eslint-disable-line node/no-deprecated-api

const { Issuer, generators, custom } = require('openid-client')
const got = require('got')
const jose = require('jose')

const { scoped: getLogger } = require('../../debug')

custom.setHttpOptionsDefaults({ timeout: 15000 })

async function greenPath ({
  moduleId,
  issuer: identifier,
  variant,
  params,
  metadata: { certificate, scope, ...metadata }
}) {
  const log = getLogger(moduleId)
  const par = variant.fapi_auth_request_method === 'pushed'
  const pkce = par === true
  const jarm = variant.fapi_response_mode === 'jarm'

  let response_type = 'code id_token'

  if (jarm) {
    response_type = 'code'
  }

  const oauthCallback = variant.fapi_jarm_type === 'plain_oauth'

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

  const keystore = jose.JWKS.asKeyStore(metadata.jwks)

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
      }, new Set())
    ],
    ...metadata,
    jwks: keystore.toJWKS()
  }

  const accountsEndpoint = `${identifier.replace(
    '/test/',
    '/test-mtls/'
  )}open-banking/v1.1/accounts`
  const issuer = await Issuer.discover(identifier)

  log('discovered issuer', JSON.stringify(issuer.metadata, null, 4))
  log('accounts_endpoint', accountsEndpoint)

  const client = new issuer.FAPI1Client(clientMetadata, metadata.jwks)

  log('client', JSON.stringify(client.metadata, null, 4))

  client[custom.clock_tolerance] = 5
  client[custom.http_options] = (url, options) => {
    log('client is making a request to', url.href)

    if (
      url.href === issuer.token_endpoint ||
      url.href === issuer.mtls_endpoint_aliases?.token_endpoint ||
      url.href === issuer.pushed_authorization_request_endpoint ||
      url.href === issuer.mtls_endpoint_aliases?.pushed_authorization_request_endpoint ||
      url.href === accountsEndpoint
    ) {
      log('adding mTLS key and certificate')
      return {
        key: keystore.get().toPEM(true),
        cert: certificate
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
              values: ['urn:openbanking:psd2:sca', 'urn:openbanking:psd2:ca']
            }
          }
        },
    ...(pkce
      ? {
          code_challenge_method: 'S256',
          code_challenge: generators.codeChallenge(codeVerifier)
        }
      : undefined),
    ...params
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
    request: requestObject
  }

  let url
  if (par) {
    const { request_uri } = await client.pushedAuthorizationRequest({
      request: requestObject
    })
    url = client.authorizationUrl({ request_uri })
  } else {
    url = client.authorizationUrl(authorizationParams)
  }

  log('redirecting to authorization_endpoint', url)
  const authorization = await got.get(url, { followRedirect: false })

  const {
    headers: { location }
  } = authorization
  const { query: callbackParams } = parseUrl(location.replace('#', '?'), true)
  log('got a callback', JSON.stringify({ ...callbackParams }, null, 4))

  const tokens = await client[oauthCallback ? 'oauthCallback' : 'callback'](
    redirect_uri,
    callbackParams,
    { response_type, nonce, state, jarm, code_verifier: codeVerifier }
  ).catch((error) => {
    log('failed to process callback:', error.message)
    throw error
  })
  log('processed callback', JSON.stringify(tokens, null, 4))
  let resource
  if (tokens.access_token) {
    resource = await client.requestResource(accountsEndpoint, tokens)
    log(
      'resource endpoint response',
      JSON.stringify(JSON.parse(resource.body), null, 4)
    )
  }
  let claims
  if (tokens.id_token) {
    claims = tokens.claims()
  }

  return { tokens, resource, claims }
}

module.exports = greenPath
