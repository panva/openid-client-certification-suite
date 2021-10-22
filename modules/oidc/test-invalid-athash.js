const helpers = require('../../helpers')

module.exports = async ({ variant, issuer, moduleId }) => {
  return helpers.rejects(moduleId)(
    helpers.oidc.greenPath({
      moduleId,
      issuer,
      variant
    }),
    {
      name: 'RPError',
      message: /^at_hash mismatch, expected (?<atHash>.+), got: \k<atHash>1/
    }
  )
}
