const jose = require('jose')
const selfsigned = require('selfsigned')
const { nanoid } = require('nanoid')

const normalize = (cert) =>
  cert.replace(/(?:-----(?:BEGIN|END) CERTIFICATE-----|\s)/g, '')
const ALIAS = `openid-client-${nanoid()}`

async function generate (asKeyArg) {
  const client = new jose.JWKS.KeyStore()
  const { private: pkey, cert } = selfsigned.generate(null, { keySize: 2048 })
  client.add(jose.JWK.asKey(pkey, { x5c: [normalize(cert)], ...asKeyArg }))
  return { client, certificate: cert }
}

module.exports = async ({ variant, SUITE_BASE_URL }) => {
  const server = new jose.JWKS.KeyStore()
  await server.generate('RSA', 2048, { alg: 'PS256', use: 'sig' })

  const { client, certificate: cert } = await generate().catch(generate)
  const { client: client2, certificate: cert2 } = await generate({
    use: 'sig'
  }).catch(generate)
  await client2.generate('RSA', 2048, { use: 'enc', alg: 'RSA-OAEP-256' })

  const { fapi_client_type: fapiClientType } = variant

  const configuration = {
    alias: ALIAS,
    description:
      process.env.DESCRIPTION || 'test suite runner for openid-client',
    server: {
      jwks: server.toJWKS(true)
    },
    waitTimeoutSeconds: 2,
    client: {
      client_id: `client-id-${ALIAS}`,
      scope:
        fapiClientType === 'plain_oauth'
          ? 'All your base are belong to us'
          : 'openid',
      redirect_uri: 'https://openid-client.local/cb',
      jwks: client.toJWKS(),
      certificate: cert
    },
    client2: {
      client_id: `client2-id-${ALIAS}`,
      scope:
        fapiClientType === 'plain_oauth'
          ? 'All your base are belong to us'
          : 'openid',
      redirect_uri: 'https://openid-client2.local/cb',
      jwks: client2.toJWKS(),
      id_token_encrypted_response_alg: 'RSA-OAEP-256',
      certificate: cert2
    }
  }

  const moduleDefinitionExtra = {
    issuer: `${SUITE_BASE_URL}/test/a/${ALIAS}/`,
    client: {
      ...configuration.client,
      jwks: client.toJWKS(true)
    },
    client2: {
      ...configuration.client2,
      jwks: client2.toJWKS(true)
    }
  }

  return {
    configuration,
    moduleDefinitionExtra
  }
}
