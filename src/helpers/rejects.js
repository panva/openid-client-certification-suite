const { strict: assert } = require('node:assert')
const { scoped: getLogger } = require('../debug')

module.exports = (moduleId) => {
  const log = getLogger(moduleId)
  return async function rejects(...args) {
    await assert.rejects(...args)
    const [, err] = args
    log('client threw the following expected error pattern', err)
  }
}
