const { strict: assert } = require('node:assert')
const timekeeper = require('timekeeper')

const helpers = require('../../helpers')

module.exports = async ({ variant, issuer: identifier, moduleId }) => {
  let issuer
  let client

  await assert.doesNotReject(
    (async () => {
      ;({ issuer, client } = await helpers.oidc.greenPath({
        moduleId,
        issuer: identifier,
        variant,
      }))
    })(),
  )

  timekeeper.travel(Date.now() + 61 * 1000) // travel one minute from now, making the cached keystore stale

  return assert
    .doesNotReject(
      helpers.oidc.greenPath({
        moduleId,
        issuer,
        client,
        variant,
      }),
    )
    .finally(() => timekeeper.reset())
}
