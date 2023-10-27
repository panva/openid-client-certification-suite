const { strict: assert } = require('node:assert')

const helpers = require('../../../helpers')

module.exports = async ({ variant, issuer, accounts_endpoint, client2: client, moduleId }) => {
  return assert.doesNotReject(
    helpers.fapi['1.0'].greenPath({
      issuer,
      accounts_endpoint,
      variant,
      metadata: client,
      moduleId,
    }),
  )
}
