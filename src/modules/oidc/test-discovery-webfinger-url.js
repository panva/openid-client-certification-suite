const { strict: assert } = require('node:assert')

const helpers = require('../../helpers')

module.exports = async ({ variant, moduleId }) => {
  const { SUITE_BASE_URL = 'https://www.certification.openid.net' } = process.env
  const { host } = new URL(SUITE_BASE_URL)

  return assert.doesNotReject(
    helpers.oidc.greenPath({
      moduleId,
      webfinger: `https://${host}/${moduleId}/oidcc-client-test-discovery-webfinger-url`,
      variant,
      stopWithDiscovery: true,
    }),
  )
}
