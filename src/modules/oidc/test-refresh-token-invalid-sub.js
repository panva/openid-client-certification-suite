const { strict: assert } = require('node:assert')

const helpers = require('../../helpers')

module.exports = async ({ variant, issuer, moduleId }) => {
  const regularflow = helpers.oidc.greenPath({
    issuer,
    variant,
    skipUserinfo: true,
  })

  await assert.doesNotReject(regularflow)
  const { client, tokens } = await regularflow

  return helpers.rejects(moduleId)(helpers.oidc.refreshToken({ client, tokens }), {
    name: 'RPError',
    message: /^sub mismatch, expected (?<sub>.+), got: \k<sub>invalid$/,
  })
}
