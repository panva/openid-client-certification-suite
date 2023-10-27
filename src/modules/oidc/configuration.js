module.exports = async () => {
  const configuration = {
    description: process.env.DESCRIPTION || 'test suite runner for openid-client',
    waitTimeoutSeconds: 2,
  }

  const moduleDefinitionExtra = {}

  return {
    configuration,
    moduleDefinitionExtra,
  }
}
