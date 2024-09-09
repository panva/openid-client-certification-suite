const util = require('node:util')
const crypto = require('node:crypto')

const selfsigned = require('selfsigned')
const jose = require('jose')
const { nanoid } = require('nanoid')

const normalize = (cert) => cert.replace(/(?:-----(?:BEGIN|END) CERTIFICATE-----|\s)/g, '')
const ALIAS = `openid-client-${nanoid()}`

async function generate({ includeEncryptionKey = false } = {}) {
  const { private: pkey, cert: certificate } = selfsigned.generate(null, { keySize: 2048 })

  const privateKey = crypto.createPrivateKey(pkey).export({ format: 'jwk' })
  const publicKey = crypto.createPublicKey(pkey).export({ format: 'jwk' })

  const x5c = normalize(certificate)
  const kid = await jose.calculateJwkThumbprint(publicKey)

  const result = {
    certificate,
    jwks: {
      keys: [{ ...publicKey, x5c: [x5c], use: 'sig', alg: 'PS256', kid }],
    },
    private_jwks: {
      keys: [{ ...privateKey, x5c: [x5c], use: 'sig', alg: 'PS256', kid }],
    },
  }

  if (includeEncryptionKey) {
    const { publicKey, privateKey } = await util.promisify(crypto.generateKeyPair)('rsa', {
      modulusLength: 2048,
      privateKeyEncoding: { format: 'jwk' },
      publicKeyEncoding: { format: 'jwk' },
    })

    const kid = await jose.calculateJwkThumbprint(publicKey)
    result.private_jwks.keys.push({ ...privateKey, use: 'enc', alg: 'RSA-OAEP-256', kid })
    result.jwks.keys.push({ ...publicKey, use: 'enc', alg: 'RSA-OAEP-256', kid })
  }

  return result
}

module.exports = async ({ variant, SUITE_BASE_URL, PLAN_NAME }) => {
  const { privateKey: serverKey } = await util.promisify(crypto.generateKeyPair)('rsa', {
    modulusLength: 2048,
  })
  const serverJwk = serverKey.export({ format: 'jwk' })

  const includeEncryptionKey = PLAN_NAME.startsWith('fapi1')

  const client = await generate()
  const client2 = await generate({ includeEncryptionKey })

  const { fapi_client_type: fapiClientType } = variant

  const configuration = {
    alias: ALIAS,
    description: process.env.DESCRIPTION || 'test suite runner for openid-client',
    server: {
      jwks: {
        keys: [
          {
            ...serverJwk,
            alg: 'PS256',
            use: 'sig',
            kid: await jose.calculateJwkThumbprint(serverJwk),
          },
        ],
      },
    },
    waitTimeoutSeconds: 2,
    client: {
      client_id: `client-id-${ALIAS}`,
      scope: fapiClientType === 'plain_oauth' ? 'All your base are belong to us' : 'openid',
      redirect_uri: 'https://openid-client.local/cb',
      jwks: client.jwks,
      certificate: client.certificate,
    },
    client2: {
      client_id: `client2-id-${ALIAS}`,
      scope: fapiClientType === 'plain_oauth' ? 'All your base are belong to us' : 'openid',
      redirect_uri: 'https://openid-client2.local/cb',
      jwks: client2.jwks,
      certificate: client2.certificate,
      ...(includeEncryptionKey
        ? {
            id_token_encrypted_response_alg: 'RSA-OAEP-256',
          }
        : undefined),
    },
  }

  const moduleDefinitionExtra = {
    issuer: `${SUITE_BASE_URL}/test/a/${ALIAS}/`,
    client: {
      ...configuration.client,
      jwks: client.private_jwks,
    },
    client2: {
      ...configuration.client2,
      jwks: client2.private_jwks,
    },
  }

  return {
    configuration,
    moduleDefinitionExtra,
  }
}
