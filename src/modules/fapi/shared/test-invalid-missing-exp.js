const helpers = require('../../../helpers')

module.exports =
  (version) =>
  async ({ variant, issuer, accounts_endpoint, client, moduleId }) => {
    return helpers.rejects(moduleId)(
      helpers.fapi[version].greenPath({
        issuer,
        accounts_endpoint,
        variant,
        metadata: client,
        moduleId,
      }),
      {
        name: 'RPError',
        message: 'missing required JWT property exp',
      },
    )
  }
