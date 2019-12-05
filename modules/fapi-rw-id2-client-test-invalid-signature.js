const { strict: assert } = require('assert')

const helpers = require('../helpers')

module.exports = async ({ variant, issuer, client, debug }) => {
  return assert.rejects(
    helpers.greenPath({
      issuer,
      variant,
      metadata: client,
      debug
    }),
    {
      name: 'RPError',
      message: 'failed to validate JWT signature'
    }
  )
}
