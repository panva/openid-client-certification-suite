const helpers = require('../../helpers')

module.exports = async ({ variant, issuer, moduleId }) => {
  return helpers.rejects(moduleId)(
    helpers.oidc.greenPath({
      issuer,
      variant,
      params: {
        max_age: 0,
        prompt: 'none'
      },
      moduleId
    }),
    {
      name: 'OPError',
      error: 'login_required',
      error_description: 'This is a login_required error response'
    }
  )
}
