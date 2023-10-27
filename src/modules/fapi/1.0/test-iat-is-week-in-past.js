const helpers = require('../../../helpers')

module.exports = async ({ variant, issuer, accounts_endpoint, client, moduleId }) => {
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
      message: /^JWT issued too far in the past, now \d+, iat \d+$/,
    },
  )
}