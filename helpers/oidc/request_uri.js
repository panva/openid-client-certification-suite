const { nanoid } = require('nanoid')
const got = require('got')
const sample = require('lodash/sample')

const echoService = 'https://limitless-retreat-96294.herokuapp.com'

module.exports = async (requestObject) => {
  const id = nanoid()
  const url = `${echoService}/${id}`

  await got.post(url, {
    body: requestObject,
    headers: {
      'content-type': sample([
        'application/jwt',
        'application/oauth.authz.req+jwt'
      ])
    }
  })

  return url
}
