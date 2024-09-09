const { strict: assert } = require('node:assert')

const helpers = require('../../helpers')

module.exports = async ({ variant, issuer, moduleId }) => {
  return assert.doesNotReject(
    helpers.oidc.greenPath({
      issuer,
      variant,
      metadata: {
        token_endpoint_auth_method: 'client_secret_basic',
      },
      moduleId,
    }),
  )
}
