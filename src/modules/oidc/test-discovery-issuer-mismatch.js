const helpers = require('../../helpers')

module.exports = async ({ variant, moduleId }) => {
  const { SUITE_BASE_URL = 'https://www.certification.openid.net' } = process.env
  const { host } = new URL(SUITE_BASE_URL)

  return helpers.rejects(moduleId)(
    helpers.oidc.greenPath({
      moduleId,
      webfinger: `https://${host}/${moduleId}/oidcc-client-test-discovery-issuer-mismatch`,
      variant,
    }),
    {
      name: 'RPError',
      message: /^discovered issuer mismatch, expected (?<iss>.+), got: \k<iss>INVALID$/,
    },
  )
}
