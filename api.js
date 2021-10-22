/* eslint-disable no-await-in-loop */
const { strict: assert } = require('assert')
const { createWriteStream } = require('fs')
const stream = require('stream')
const { promisify } = require('util')

const Got = require('got')
const ms = require('ms')

const pipeline = promisify(stream.pipeline)

const { runner: debug } = require('./debug')

const FINISHED = new Set(['FINISHED'])
const RESULTS = new Set(['REVIEW', 'PASSED'])

class API {
  constructor ({ baseUrl, bearerToken } = {}) {
    assert(baseUrl, 'argument property "baseUrl" missing')

    const { get, post } = Got.extend({
      prefixUrl: baseUrl,
      throwHttpErrors: false,
      followRedirect: false,
      headers: {
        ...(bearerToken
          ? { authorization: `bearer ${bearerToken}` }
          : undefined),
        'content-type': 'application/json'
      },
      responseType: 'json',
      retry: 0,
      timeout: 10000
    })

    this.get = get
    this.post = post

    this.stream = Got.extend({
      prefixUrl: baseUrl,
      throwHttpErrors: false,
      followRedirect: false,
      headers: {
        ...(bearerToken
          ? { authorization: `bearer ${bearerToken}` }
          : undefined),
        'content-type': 'application/json'
      },
      retry: 0
    }).stream
  }

  async getAllTestModules () {
    const { statusCode, body: response } = await this.get(
      'api/runner/available'
    )

    assert.equal(statusCode, 200)

    return response
  }

  async createTestPlan ({ planName, configuration, variant } = {}) {
    assert(planName, 'argument property "planName" missing')
    assert(configuration, 'argument property "configuration" missing')

    const { statusCode, body: response } = await this.post('api/plan', {
      searchParams: {
        planName,
        variant: JSON.stringify(variant)
      },
      json: configuration
    })

    assert.equal(statusCode, 201)

    return response
  }

  async getTestPlan ({ planId } = {}) {
    assert(planId, 'argument property "planId" missing')

    const { statusCode, body: response } = await this.get(`api/plan/${planId}`)

    assert.equal(statusCode, 200)

    return response
  }

  async createTestFromPlan ({ plan, test, variant } = {}) {
    assert(plan, 'argument property "plan" missing')
    assert(test, 'argument property "test" missing')

    const searchParams = { test, plan }

    if (variant) {
      Object.assign(searchParams, { variant: JSON.stringify(variant) })
    }

    const { statusCode, body: response } = await this.post('api/runner', {
      searchParams
    })

    assert.equal(statusCode, 201)

    return response
  }

  async getModuleInfo ({ moduleId } = {}) {
    assert(moduleId, 'argument property "moduleId" missing')

    const { statusCode, body: response } = await this.get(
      `api/info/${moduleId}`
    )

    assert.equal(statusCode, 200)

    return response
  }

  async getTestLog ({ moduleId } = {}) {
    assert(moduleId, 'argument property "moduleId" missing')

    const { statusCode, body: response } = await this.get(
      `api/log/${moduleId}`
    )

    assert.equal(statusCode, 200)

    return response
  }

  async downloadArtifact ({ planId } = {}) {
    assert(planId, 'argument property "planId" missing')
    const filename = `export-${planId}.zip`
    return pipeline(
      this.stream(`api/plan/exporthtml/${planId}`, {
        headers: { accept: 'application/zip' },
        responseType: 'buffer'
      }),
      createWriteStream(filename)
    )
  }

  async waitForState ({
    moduleId,
    interval = ms('2s'),
    timeout = ms('60s'),
    states = FINISHED,
    results = RESULTS
  } = {}) {
    const timeoutAt = Date.now() + timeout

    do {
      const { status, result } = await this.getModuleInfo({ moduleId })
      if (states.has(status)) {
        if (results.size) {
          if (!status || !result) continue
          if (!results.has(result)) {
            throw new Error(`module id ${moduleId} is ${status} but ${result}`)
          }
        } else {
          if (!status) continue
        }

        return [status, result]
      }

      if (status === 'INTERRUPTED') {
        throw new Error(`module id ${moduleId} is ${status}`)
      }

      await new Promise((resolve) => setTimeout(resolve, interval))
    } while (Date.now() < timeoutAt)

    debug(
      `module id ${moduleId} expected state timeout`,
      Date.now() < timeoutAt,
      Date.now(),
      timeoutAt
    )
    throw new Error(
      `Timed out waiting for test module ${moduleId} to be in one of states: ${[
        ...states
      ].join(', ')}`
    )
  }
}

module.exports = API
