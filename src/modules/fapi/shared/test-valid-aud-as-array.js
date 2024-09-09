const { strict: assert } = require('node:assert')

const helpers = require('../../../helpers')

module.exports =
  (version) =>
  async ({ variant, issuer, accounts_endpoint, client, moduleId }) => {
    return assert.doesNotReject(
      helpers.fapi[version].greenPath({
        issuer,
        accounts_endpoint,
        variant,
        metadata: client,
        moduleId,
      }),
    )
  }
