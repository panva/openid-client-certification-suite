const helpers = require('../../helpers')

module.exports = async ({ variant, issuer, moduleId }) => {
  return helpers.rejects(moduleId)(
    helpers.oidc.greenPath({
      moduleId,
      issuer,
      variant,
      forceNonce: true,
    }),
    {
      name: 'RPError',
      message: /^nonce mismatch, expected (?<nonce>.+), got: \k<nonce>1$/,
    },
  )
}
