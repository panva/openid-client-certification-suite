module.exports = (metadata) => {
  return (
    (metadata.token_endpoint_auth_method === 'self_signed_tls_client_auth' ||
      metadata.token_endpoint_auth_method === 'private_key_jwt' ||
      (metadata.request_object_signing_alg && metadata.request_object_signing_alg !== 'none') ||
      metadata.authorization_encrypted_response_enc ||
      metadata.authorization_encrypted_response_alg ||
      metadata.id_token_encrypted_response_alg ||
      metadata.id_token_encrypted_response_enc ||
      metadata.userinfo_encrypted_response_alg ||
      metadata.userinfo_encrypted_response_enc) &&
    !('jwks' in metadata)
  )
}
