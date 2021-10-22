const helpers = require('../../../helpers')

module.exports = async ({ variant, issuer, client2: client, moduleId }) => {
  return helpers.rejects(moduleId)(
    helpers.fapi.greenPath({
      issuer,
      variant,
      metadata: client,
      moduleId
    }),
    {
      name: 'RPError',
      message:
        'unexpected JWE alg received, expected RSA-OAEP-256, got: RSA1_5'
    }
  )
}
