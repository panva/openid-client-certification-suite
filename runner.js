/* eslint-disable no-await-in-loop */
/* eslint-env mocha */

const { strict: assert } = require('assert')
const { existsSync, createWriteStream } = require('fs')
const path = require('path')
const util = require('util')

const jose = require('jose')
const selfsigned = require('selfsigned').generate(null, { keySize: 2048 })
const open = require('open')
const Debug = require('debug')

const debug = require('./debug')
const API = require('./api')

const normalize = (cert) => cert.replace(/(?:-----(?:BEGIN|END) CERTIFICATE-----|\s)/g, '')

const {
  ALIAS = 'openid-client',
  VARIANT = 'mtls',
  PLAN_NAME = 'fapi-rw-id2-client-test-plan',
  SUITE_ACCESS_TOKEN = '5t2Z8kSqBb2IREMSf/mULVEr5E7LI5oODrtrQW3kXqTFD0uBctEnRoe8zv8n6GTD40yph4MCdxpY6l/2BNRnPQ==',
  SUITE_BASE_URL = 'https://www.certification.openid.net',
  ONLY,
  OPEN_PLAN,
  OPEN_MODULE
} = process.env;

(async () => {
  assert(ALIAS, 'process.env.ALIAS missing')
  assert(VARIANT, 'process.env.VARIANT missing')
  assert(PLAN_NAME, 'process.env.PLAN_NAME missing')
  assert(SUITE_BASE_URL, 'process.env.SUITE_BASE_URL missing')

  const variant = VARIANT

  const server = new jose.JWKS.KeyStore()
  await server.generateSync('RSA', 2048, { alg: 'PS256', use: 'sig' })

  const client = new jose.JWKS.KeyStore()
  client.add(jose.JWK.asKey(selfsigned.private, { x5c: [normalize(selfsigned.cert)] }))

  const configuration = {
    alias: ALIAS,
    description: 'test suite runner for openid-client',
    server: {
      jwks: server.toJWKS(true)
    },
    waitTimeoutSeconds: 2,
    client: {
      client_id: `client-id-${ALIAS}`,
      scope: 'openid',
      redirect_uri: 'https://openid-client.local/cb',
      jwks: client.toJWKS(),
      certificate: selfsigned.cert
    }
  }

  const runner = new API({ baseUrl: SUITE_BASE_URL, bearerToken: SUITE_ACCESS_TOKEN })

  let PLAN_ID
  let MODULES

  if (!process.env.PLAN_ID) {
    const plan = await runner.createTestPlan({
      configuration,
      planName: PLAN_NAME,
      variant
    });

    ({ id: PLAN_ID, modules: MODULES } = plan)

    debug('Created test plan, new id %s', PLAN_ID)
  } else {
    ({ PLAN_ID } = process.env)

    const { modules } = await runner.getTestPlan({
      planId: PLAN_ID
    })

    MODULES = modules.map((module) => module.testModule)
    debug('Loaded test plan id %s', PLAN_ID)
  }

  const planDetail = util.format('%s/plan-detail.html?plan=%s', SUITE_BASE_URL, PLAN_ID)

  debug(planDetail)
  debug('modules %O', MODULES)

  if (OPEN_PLAN) {
    after(() => open(planDetail, { wait: false }))
  }

  for (const moduleName of MODULES) { // eslint-disable-line no-restricted-syntax
    const moduleFile = path.join(__dirname, 'modules', `${moduleName}.js`)
    if (existsSync(moduleFile) && (!ONLY || ONLY === moduleName)) {
      it(moduleName, async function () {
        const moduleDefinition = require(moduleFile)
        debug('Running test module: %s', moduleName)
        const { id: moduleId } = await runner.createTestFromPlan({ plan: PLAN_ID, test: moduleName })
        debug('Created test module, new id: %s', moduleId)
        const moduleUrl = util.format('%s/log-detail.html?log=%s', SUITE_BASE_URL, moduleId)
        debug(moduleUrl)
        if (OPEN_MODULE) {
          await open(moduleUrl, { wait: false })
        }
        await runner.waitForState({ moduleId, timeout: 5 * 1000, interval: 100, states: new Set(['WAITING']), results: new Set() })
        debug('Running %s', moduleFile)
        const moduleDebug = Debug(moduleName)
        const stream = createWriteStream(`logs/test-log-${moduleName}-${moduleId}.txt`)
        stream.write(`URL: ${moduleUrl}\n\n`)
        moduleDebug.log = (...args) => {
          stream.write(`${util.format(...args)}\n\n`)
        }
        return Promise.all([
          runner.waitForState({ moduleId }),
          moduleDefinition({
            variant,
            issuer: `${SUITE_BASE_URL}/test/a/${ALIAS}/`,
            client: {
              ...configuration.client,
              jwks: client.toJWKS(true)
            },
            debug: moduleDebug
          })
        ])
      })
    } else {
      it.skip(moduleName)
    }
  }

  run()
})().catch((err) => {
  process.exitCode = 1
  debug(err)
})
