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
      message: /^c_hash mismatch, expected (?<cHash>.+), got: \k<cHash>1/
    }
  )
}
