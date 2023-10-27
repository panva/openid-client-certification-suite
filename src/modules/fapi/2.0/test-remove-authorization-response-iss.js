const helpers = require('../../../helpers')

module.exports = async ({ variant, issuer, accounts_endpoint, client, moduleId }) => {
  return helpers.rejects(moduleId)(
    helpers.fapi['2.0'].greenPath({
      issuer,
      accounts_endpoint,
      variant,
      metadata: client,
      moduleId,
    }),
    {
      name: 'RPError',
      message: 'iss missing from the response',
    },
  )
}
