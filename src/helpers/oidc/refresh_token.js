async function refreshToken({ client, tokens, userinfoArgs = [] }) {
  tokens = await client.refresh(tokens)

  let userinfo
  if (tokens.access_token) {
    userinfo = await client.userinfo(tokens, ...userinfoArgs)
  }
  const claims = tokens.claims()

  return { tokens, userinfo, claims, client }
}

module.exports = refreshToken
