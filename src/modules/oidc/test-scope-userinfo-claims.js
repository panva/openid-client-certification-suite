const helpers = require('../../helpers')

module.exports = async ({ variant, issuer, moduleId }) => {
  return helpers.oidc.greenPath({
    moduleId,
    issuer,
    variant,
    params: {
      scope: 'openid email',
    },
  })
}
