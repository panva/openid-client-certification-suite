const { strict: assert } = require('node:assert')
const { existsSync, writeFileSync } = require('node:fs')
const path = require('node:path')
const util = require('node:util')
const fs = require('node:fs')

const open = require('open')
const parallel = require('mocha.parallel')
const timekeeper = require('timekeeper')

const { runner: debug, set: setModuleReference } = require('./debug')
const API = require('./api')

const {
  VARIANT,
  PLAN_NAME,
  SUITE_ACCESS_TOKEN,
  SUITE_BASE_URL = 'https://www.certification.openid.net',
  ONLY,
  OPEN_PLAN,
  OPEN_MODULE,
} = process.env

assert(PLAN_NAME, 'process.env.PLAN_NAME missing')
assert(SUITE_BASE_URL, 'process.env.SUITE_BASE_URL missing')

const stripPlanNames = (moduleName) => {
  switch (true) {
    case moduleName.startsWith('fapi1'):
    case moduleName.startsWith('fapi-rw-id2'):
      return moduleName.substring(PLAN_NAME.length - 9)
    case PLAN_NAME.startsWith('fapi2-security-profile'):
    case PLAN_NAME.startsWith('fapi2-message-signing'):
      return moduleName.replace(/fapi2-security-profile-.+-client-/, '')
    case moduleName.startsWith('oidcc-client'):
      return moduleName.replace('oidcc-client-', '')
    default:
      throw new Error('not implemented')
  }
}

const core = {
  request_type: 'plain_http_request',
  client_registration: 'dynamic_client',
}
const planDefaults = {
  'fapi-rw-id2-client-test-plan': {
    fapi_profile: 'plain_fapi',
    client_auth_type: 'private_key_jwt',
  },
  'fapi1-advanced-final-client-test-plan': {
    fapi_profile: 'plain_fapi',
    fapi_client_type: 'oidc',
    fapi_auth_request_method: 'by_value',
    fapi_response_mode: 'plain_response',
    client_auth_type: 'private_key_jwt',
  },
  'fapi2-security-profile-id2-client-test-plan': {
    fapi_client_type: 'oidc',
    fapi_profile: 'plain_fapi',
  },
  'fapi2-message-signing-id1-client-test-plan': {
    fapi_request_method: 'signed_non_repudiation',
    fapi_response_mode: 'jarm',
    fapi_client_type: 'oidc',
    fapi_profile: 'plain_fapi',
  },
  'oidcc-client-basic-certification-test-plan': core,
  'oidcc-client-hybrid-certification-test-plan': core,
  'oidcc-client-implicit-certification-test-plan': core,
  'oidcc-client-config-certification-test-plan': {
    ...core,
    response_mode: 'default',
    client_auth_type: 'client_secret_basic',
  },
  'oidcc-client-dynamic-certification-test-plan': {
    client_auth_type: 'client_secret_basic',
    response_mode: 'default',
  },
}

const SERIAL = new Set([
  'oidcc-client-config-certification-test-plan',
  'oidcc-client-dynamic-certification-test-plan',
])

assert(VARIANT || planDefaults[PLAN_NAME], 'process.env.VARIANT missing')

const variant = {
  ...planDefaults[PLAN_NAME],
  ...(VARIANT ? JSON.parse(VARIANT) : undefined),
}

;(async () => {
  let configuration
  let moduleDefinitionExtra
  if (PLAN_NAME.startsWith('fapi')) {
    ;({ configuration, moduleDefinitionExtra } = await require('./modules/fapi/configuration')({
      PLAN_NAME,
      variant,
      SUITE_BASE_URL,
    }))
  } else {
    ;({ configuration, moduleDefinitionExtra } = await require('./modules/oidc/configuration')({
      PLAN_NAME,
      variant,
      SUITE_BASE_URL,
    }))
  }

  const runner = new API({
    baseUrl: SUITE_BASE_URL,
    bearerToken: SUITE_ACCESS_TOKEN,
  })

  const plan = await runner.createTestPlan({
    configuration,
    planName: PLAN_NAME,
    variant,
  })

  const { id: PLAN_ID, modules: MODULES } = plan

  const { certificationProfileName } = await runner.getTestPlan({
    planId: PLAN_ID,
  })

  debug('Created test plan, new id %s', PLAN_ID)
  if (certificationProfileName) {
    debug('CERTIFICATION PROFILE NAME "%s"', certificationProfileName)
  }

  const planDetail = util.format('%s/plan-detail.html?plan=%s', SUITE_BASE_URL, PLAN_ID)

  debug(planDetail)
  debug('modules %O', MODULES)

  afterEach(() => timekeeper.reset())

  if (OPEN_PLAN) {
    after(() => open(planDetail, { wait: false }))
  }

  const subfolders = []
  if (PLAN_NAME.startsWith('fapi')) {
    subfolders.push('fapi')
    if (PLAN_NAME.startsWith('fapi-rw-id2') || PLAN_NAME.startsWith('fapi1')) {
      subfolders.push('1.0')
    } else if (PLAN_NAME.startsWith('fapi2')) {
      subfolders.push('2.0')
    } else {
      throw new Error('not implemented')
    }
  } else if (PLAN_NAME.startsWith('oidcc')) {
    subfolders.push('oidc')
  } else {
    throw new Error('not implemented')
  }

  if (fs.existsSync('.failed')) {
    fs.unlinkSync('.failed')
  }

  describe(PLAN_NAME, async function () {
    after(async function () {
      if (fs.existsSync('.failed')) {
        fs.unlinkSync('.failed')
        process.exitCode |= 1
        return runner.downloadArtifact({ planId: PLAN_ID })
      }
      return undefined
    })

    parallel('', async function () {
      for (const module of MODULES) {
        const { testModule: moduleName } = module
        const strippedModuleName = stripPlanNames(moduleName)
        const moduleFile = path.join(
          __dirname,
          'modules',
          ...subfolders,
          `${strippedModuleName}.js`,
        )

        if (!existsSync(moduleFile)) {
          writeFileSync(moduleFile, '')
        }

        const moduleDefinition = require(moduleFile)
        if (
          typeof moduleDefinition === 'function' &&
          (!ONLY || [moduleName, strippedModuleName].includes(ONLY.replace('.js', '')))
        ) {
          it(`${moduleName} ${
            module.variant ? JSON.stringify(module.variant) : ''
          }`, async function () {
            debug('Running test module: %s', moduleName)
            const { id: moduleId } = await runner.createTestFromPlan({
              plan: PLAN_ID,
              test: moduleName,
              variant: module.variant,
            })
            debug('Created test module, new id: %s', moduleId)
            const moduleUrl = util.format('%s/log-detail.html?log=%s', SUITE_BASE_URL, moduleId)
            debug(moduleUrl)
            if (OPEN_MODULE) {
              await open(moduleUrl, { wait: false })
            }
            await runner.waitForState({
              moduleId,
              states: new Set(['WAITING']),
              results: new Set(),
            })
            const { issuer, accounts_endpoint } = await runner.getTestExposed({ moduleId })
            debug('Running %s', moduleFile)
            const moduleVariant = { ...variant, ...module.variant }
            setModuleReference(moduleId, {
              planId: PLAN_ID,
              variant: moduleVariant,
              moduleName,
            })
            try {
              const result = await moduleDefinition({
                issuer,
                accounts_endpoint,
                moduleId,
                variant: moduleVariant,
                ...moduleDefinitionExtra,
              })
              if (result?.skipped) {
                await runner.waitForState({ moduleId, results: new Set(['SKIPPED']) })
              } else {
                await runner.waitForState({ moduleId })
              }
            } catch (err) {
              fs.writeFileSync('.failed', Buffer.alloc(0))
              throw err
            }
          })
        } else {
          it.skip(moduleName)
        }
      }
    })
  })

  if (configuration.alias || SERIAL.has(PLAN_NAME)) {
    parallel.limit(1)
  } else {
    parallel.limit(10)
  }

  run()
})().catch((err) => {
  process.exitCode = 1
  debug(err)
})
