const { strict: assert } = require('assert')

const helpers = require('../../helpers')

module.exports = async ({ variant, issuer, moduleId }) => {
  return assert.doesNotReject(
    helpers.oidc.greenPath({
      moduleId,
      issuer,
      variant,
      metadata: {
        userinfo_signed_response_alg: 'RS256'
      }
    })
  )
}
