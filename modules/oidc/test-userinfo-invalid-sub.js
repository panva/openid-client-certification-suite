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
      message:
        /^userinfo sub mismatch, expected (?<sub>.+), got: \k<sub>invalid$/
    }
  )
}
