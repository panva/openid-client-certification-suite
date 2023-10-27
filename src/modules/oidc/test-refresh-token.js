const { strict: assert } = require('node:assert')

const helpers = require('../../helpers')

module.exports = async ({ variant, issuer }) => {
  const regularflow = helpers.oidc.greenPath({
    issuer,
    variant,
    skipUserinfo: true,
  })

  await assert.doesNotReject(regularflow)
  const { client, tokens } = await regularflow

  return assert.doesNotReject(helpers.oidc.refreshToken({ client, tokens }))
}
