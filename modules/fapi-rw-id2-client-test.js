const { strict: assert } = require('assert')

const helpers = require('../helpers')

module.exports = async ({ variant, issuer, client, debug }) => {
  return assert.doesNotReject(
    helpers.greenPath({
      issuer,
      variant,
      metadata: client,
      debug
    })
  )
}
