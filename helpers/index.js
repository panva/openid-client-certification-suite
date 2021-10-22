module.exports = {
  rejects: require('./rejects'),
  fapi: {
    greenPath: require('./fapi/green_path')
  },
  oidc: {
    greenPath: require('./oidc/green_path'),
    refreshToken: require('./oidc/refresh_token')
  }
}
