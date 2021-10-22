const { strict: assert } = require('assert')

const helpers = require('../../../helpers')

module.exports = async ({ variant, issuer, client, moduleId }) => {
  return assert.doesNotReject(
    helpers.fapi.greenPath({
      issuer,
      variant,
      metadata: client,
      moduleId
    })
  )
}
