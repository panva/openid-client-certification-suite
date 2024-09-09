const { strict: assert } = require('node:assert')

const helpers = require('../../helpers')

module.exports = async ({ variant, issuer, moduleId }) => {
  return assert.doesNotReject(
    helpers.oidc.greenPath({
      moduleId,
      issuer,
      variant,
      stopWithDCR: true,
    }),
  )
}
