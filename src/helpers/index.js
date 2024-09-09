const skipped = () => ({ skipped: true })

module.exports = {
  rejects: require('./rejects'),
  fapi: {
    '1.0': {
      greenPath: require('./fapi/1.0/green_path'),
    },
    '2.0': {
      greenPath: require('./fapi/2.0/green_path'),
    },
  },
  oidc: {
    greenPath: require('./oidc/green_path'),
    refreshToken: require('./oidc/refresh_token'),
  },
  skipped: [skipped, skipped],
}
