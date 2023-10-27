const helpers = require('../../../helpers')

module.exports = async ({ variant, issuer, accounts_endpoint, client2: client, moduleId }) => {
  return helpers.rejects(moduleId)(
    helpers.fapi['1.0'].greenPath({
      issuer,
      accounts_endpoint,
      variant,
      metadata: client,
      moduleId,
    }),
    {
      name: 'RPError',
      message: 'unexpected JWE alg received, expected RSA-OAEP-256, got: RSA1_5',
    },
  )
}
