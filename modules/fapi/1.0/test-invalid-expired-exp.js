const helpers = require('../../../helpers')

module.exports = async ({ variant, issuer, client, moduleId }) => {
  return helpers.rejects(moduleId)(
    helpers.fapi.greenPath({
      issuer,
      variant,
      metadata: client,
      moduleId
    }),
    {
      name: 'RPError',
      message: /^JWT expired, now \d+, exp \d+$/
    }
  )
}
