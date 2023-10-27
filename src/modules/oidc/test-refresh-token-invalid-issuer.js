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
    message: /^iss mismatch, expected (?<issuer>.+), got: \k<issuer>1$/,
  })
}
