const helpers = require('../../helpers')

module.exports = async ({ variant, issuer, moduleId }) => {
  return helpers.rejects(moduleId)(
    helpers.oidc.greenPath({
      moduleId,
      issuer,
      variant,
      metadata: {
        id_token_signed_response_alg: 'RS256'
      }
    }),
    {
      name: 'RPError',
      message: 'failed to validate JWT signature'
    }
  )
}
