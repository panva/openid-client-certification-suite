/* eslint-disable camelcase */

const { parse: parseUrl } = require('url') // eslint-disable-line node/no-deprecated-api

const { Issuer, generators, custom } = require('openid-client')
const got = require('got')
const jose = require('jose')

custom.setHttpOptionsDefaults({ timeout: 15000 })

async function greenPath ({ issuer: identifier, debug, variant, params, metadata: { certificate, ...metadata } }) {
  const response_type = 'code id_token'

  let token_endpoint_auth_method
  switch (JSON.parse(variant).client_auth_type) {
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
    tls_client_certificate_bound_access_tokens: true,
    grant_types: [...response_type.split(' ').reduce((acc, type) => {
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
    }, new Set())],
    ...metadata,
    jwks: keystore.toJWKS()
  }

  const accountsEndpoint = `${identifier.replace('/test/', '/test-mtls/')}open-banking/v1.1/accounts`
  const issuer = await Issuer.discover(identifier)

  debug('discovered issuer', JSON.stringify(issuer.metadata, null, 4))
  debug('accounts_endpoint', accountsEndpoint)

  const client = new issuer.FAPIClient(clientMetadata, metadata.jwks)

  debug('client', JSON.stringify(client.metadata, null, 4))

  client[custom.clock_tolerance] = 5
  client[custom.http_options] = (options) => {
    let opts = options

    debug('client is making a request to', options.url)

    if (options.url === issuer.token_endpoint || options.url === accountsEndpoint) {
      debug('adding mTLS key and certificate')
      opts = {
        ...options,
        key: keystore.get().toPEM(true),
        cert: certificate
      }
    }

    return opts
  }

  let authorizationParams = {
    redirect_uri: client.redirect_uris[0],
    scope: 'openid',
    response_type,
    state: generators.state(),
    nonce: response_type.includes('id_token') ? generators.nonce() : undefined,
    claims: {
      id_token: {
        acr: { essential: true, values: ['urn:openbanking:psd2:sca', 'urn:openbanking:psd2:ca'] }
      }
    },
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

  const url = client.authorizationUrl(authorizationParams)

  debug('redirecting to authorization_endpoint', url)
  const authorization = await got.get(url, { followRedirect: false })

  const { headers: { location } } = authorization
  const { query: callbackParams } = parseUrl(location.replace('#', '?'), true)
  debug('got a callback', JSON.stringify({ ...callbackParams }, null, 4))

  const tokens = await client
    .callback(redirect_uri, callbackParams, { response_type, nonce, state })
    .catch((error) => {
      debug('failed to process callback:', error.message)
      throw error
    })
  debug('processed callback', JSON.stringify(tokens, null, 4))
  let resource
  if (tokens.access_token) {
    resource = await client.resource(accountsEndpoint, tokens)
    debug('resource endpoint response', JSON.stringify(JSON.parse(resource.body), null, 4))
  }
  const claims = tokens.claims()

  return { tokens, resource, claims }
}

module.exports = greenPath
