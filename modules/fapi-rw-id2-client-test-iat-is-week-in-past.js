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
      message: /^id_token issued too far in the past, now \d+, iat \d+$/
    }
  )
}
