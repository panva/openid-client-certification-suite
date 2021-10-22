/* eslint-disable camelcase */

const querystring = require('querystring')

const { parse: parseUrl } = require('url') // eslint-disable-line node/no-deprecated-api

const { Issuer, generators, custom } = require('openid-client')
const got = require('got')
const jose = require('jose')

custom.setHttpOptionsDefaults({ timeout: 15000 })

const requestUri = require('./request_uri')
const needsJWKS = require('./needs_jwks')
const { scoped: getLogger } = require('../../debug')

const envDefaults = (env) => {
  try {
    return JSON.parse(env)
  } catch (err) {}
}

module.exports = async function greenPath ({
  moduleId,
  webfinger,
  issuer: identifier,
  variant,
  client,
  params,
  metadata,
  userinfoArgs = [],
  forceNonce = false,
  skipUserinfo = false,
  stopWithDiscovery = false,
  stopWithDCR = false
}) {
  const log = getLogger(moduleId)
  const {
    client_auth_type: token_endpoint_auth_method,
    request_type,
    response_type
  } = variant

  let { response_mode } = variant

  if (response_mode === 'default') {
    response_mode = undefined
  }

  const { CLIENT_METADATA_DEFAULTS } = process.env

  let issuer
  if (identifier instanceof Issuer) {
    issuer = identifier
  } else {
    const clientMetadata = {
      ...envDefaults(CLIENT_METADATA_DEFAULTS),
      token_endpoint_auth_method,
      response_types: [response_type],
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
      redirect_uris: ['https://rp.example.com/cb'],
      ...metadata
    }

    let jwks
    if (needsJWKS(clientMetadata)) {
      const keystore = new jose.JWKS.KeyStore()
      await keystore.generate('RSA', 2048, { use: 'sig' })
      jwks = keystore.toJWKS(true)
    }

    if (identifier) {
      log('discovering issuer', identifier)
      issuer = await Issuer.discover(identifier)
      log('discovered', issuer.metadata)
    } else if (webfinger) {
      log('discovering issuer via webfinger', webfinger)
      issuer = await Issuer.webfinger(webfinger)
      log('discovered', issuer.metadata)
    }

    if (stopWithDiscovery) {
      return { issuer }
    }

    log('registering client', clientMetadata)
    client = await issuer.Client.register(clientMetadata, { jwks })
    log('registered', client.metadata)

    if (stopWithDCR) {
      return { issuer, client }
    }
    client[custom.clock_tolerance] = 5
  }

  let authorizationParams = {
    redirect_uri: client.redirect_uris[0],
    scope: 'openid',
    response_type,
    client_id: client.client_id,
    state: generators.state(),
    nonce:
      response_type.includes('id_token') || forceNonce === true
        ? generators.nonce()
        : undefined,
    response_mode,
    ...params
  }

  Object.entries(authorizationParams).forEach((key, value) => {
    if (value === null || value === undefined || value === '') {
      delete authorizationParams[key]
    }
  })

  const { state, nonce, redirect_uri } = authorizationParams

  switch (request_type) {
    case 'plain_http_request':
      break
    case 'request_uri': {
      const requestObject = await client.requestObject(authorizationParams)
      const request_uri = await requestUri(requestObject)
      authorizationParams = {
        scope: 'openid',
        response_type: authorizationParams.response_type,
        redirect_uri: undefined,
        request_uri
      }
      break
    }
    default:
      throw new TypeError(`unknown request_type ${request_type}`)
  }

  const url = client.authorizationUrl(authorizationParams)
  log('redirecting to authorization_endpoint', url)
  const authorization = await got.get(url, { followRedirect: false })

  let callbackParams
  switch (response_mode) {
    case 'query.jwt':
    case 'fragment.jwt':
    case 'form_post.jwt':
    case 'jwt':
    case 'web_message':
    case 'web_message.jwt':
      throw new Error('TODO')
    case 'form_post':
      authorization.method = 'POST'
      authorization.body = querystring.stringify(
        authorization.body
          .match(/<input type="hidden" name="\w+" value=".+"\/?>/g)
          .reduce((acc, match) => {
            const [, key, value] = match.match(/name="(\w+)" value="(.+)"/)
            acc[key] = value
            return acc
          }, {})
      )
      callbackParams = client.callbackParams(authorization)
      break
    case 'query':
    case 'fragment':
    case undefined: {
      const {
        headers: { location }
      } = authorization;
      ({ query: callbackParams } = parseUrl(location.replace('#', '?'), true))
      break
    }
    default:
      throw new TypeError(`unknown response_type ${response_type}`)
  }

  log('received callback parameters', callbackParams)

  const tokens = await client.callback(redirect_uri, callbackParams, {
    response_type,
    nonce,
    state
  })
  log('tokenset received and validated', { ...tokens })
  let userinfo
  if (tokens.access_token && !skipUserinfo) {
    userinfo = await client.userinfo(tokens, ...userinfoArgs)
    log('fetched userinfo', userinfo)
  }
  const claims = tokens.claims()
  log('validated id token claims', claims)

  return { issuer, tokens, userinfo, claims, client }
}
