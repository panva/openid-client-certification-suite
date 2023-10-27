const helpers = require('../../helpers')

module.exports = async ({ variant, issuer, moduleId }) => {
  return helpers.rejects(moduleId)(
    helpers.oidc.greenPath({
      moduleId,
      issuer,
      variant,
    }),
    {
      name: 'RPError',
      message:
        'multiple matching keys found in issuer\'s jwks_uri for key parameters {"alg":"RS256"}, kid must be provided in this case',
    },
  )
}
