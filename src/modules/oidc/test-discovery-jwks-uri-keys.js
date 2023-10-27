const { strict: assert } = require('node:assert')

const helpers = require('../../helpers')

module.exports = async ({ variant, issuer, moduleId }) => {
  let discovered

  await assert.doesNotReject(
    (async () => {
      ;({ issuer: discovered } = await helpers.oidc.greenPath({
        moduleId,
        issuer,
        variant,
        stopWithDiscovery: true,
      }))
    })(),
  )

  return assert.doesNotReject(discovered.reloadJwksUri())
}
