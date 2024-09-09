```
DESCRIPTION="openid-client v5.x Basic RP" PLAN_NAME='oidcc-client-basic-certification-test-plan' DEBUG='runner,moduleId*' npm run test < /dev/null &
DESCRIPTION="openid-client v5.x Implicit RP" PLAN_NAME='oidcc-client-implicit-certification-test-plan' DEBUG='runner,moduleId*' npm run test < /dev/null &
DESCRIPTION="openid-client v5.x Hybrid RP" PLAN_NAME='oidcc-client-hybrid-certification-test-plan' DEBUG='runner,moduleId*' npm run test < /dev/null &
DESCRIPTION="openid-client v5.x Config RP" PLAN_NAME='oidcc-client-config-certification-test-plan' DEBUG='runner,moduleId*' npm run test < /dev/null &

DESCRIPTION="openid-client v5.x FAPI1 Adv. private_key_jwt, PAR, JARM (OIDC) RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi1-advanced-final-client-test-plan' VARIANT='{"fapi_auth_request_method":"pushed","fapi_response_mode":"jarm"}' npm run test < /dev/null &
DESCRIPTION="openid-client v5.x FAPI1 Adv. private_key_jwt, PAR, JARM (OAUTH2) RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi1-advanced-final-client-test-plan' VARIANT='{"fapi_auth_request_method":"pushed","fapi_response_mode":"jarm","fapi_client_type":"plain_oauth"}' npm run test < /dev/null &
DESCRIPTION="openid-client v5.x FAPI1 Adv. private_key_jwt, PAR RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi1-advanced-final-client-test-plan' VARIANT='{"fapi_auth_request_method":"pushed"}' npm run test < /dev/null &
DESCRIPTION="openid-client v5.x FAPI1 Adv. private_key_jwt, JARM (OIDC) RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi1-advanced-final-client-test-plan' VARIANT='{"fapi_response_mode":"jarm"}' npm run test < /dev/null &
DESCRIPTION="openid-client v5.x FAPI1 Adv. private_key_jwt, JARM (OAUTH2) RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi1-advanced-final-client-test-plan' VARIANT='{"fapi_response_mode":"jarm","fapi_client_type":"plain_oauth"}' npm run test < /dev/null &
DESCRIPTION="openid-client v5.x FAPI1 Adv. private_key_jwt RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi1-advanced-final-client-test-plan' VARIANT='' npm run test < /dev/null &
DESCRIPTION="openid-client v5.x FAPI1 Adv. MTLS, PAR, JARM (OIDC) RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi1-advanced-final-client-test-plan' VARIANT='{"client_auth_type":"mtls","fapi_auth_request_method":"pushed","fapi_response_mode":"jarm"}' npm run test < /dev/null &
DESCRIPTION="openid-client v5.x FAPI1 Adv. MTLS, PAR, JARM (OAUTH2) RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi1-advanced-final-client-test-plan' VARIANT='{"client_auth_type":"mtls","fapi_auth_request_method":"pushed","fapi_response_mode":"jarm","fapi_client_type":"plain_oauth"}' npm run test < /dev/null &
DESCRIPTION="openid-client v5.x FAPI1 Adv. MTLS, PAR RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi1-advanced-final-client-test-plan' VARIANT='{"client_auth_type":"mtls","fapi_auth_request_method":"pushed"}' npm run test < /dev/null &
DESCRIPTION="openid-client v5.x FAPI1 Adv. MTLS, JARM (OIDC) RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi1-advanced-final-client-test-plan' VARIANT='{"client_auth_type":"mtls","fapi_response_mode":"jarm"}' npm run test < /dev/null &
DESCRIPTION="openid-client v5.x FAPI1 Adv. MTLS, JARM (OAUTH2) RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi1-advanced-final-client-test-plan' VARIANT='{"client_auth_type":"mtls","fapi_response_mode":"jarm","fapi_client_type":"plain_oauth"}' npm run test < /dev/null &
DESCRIPTION="openid-client v5.x FAPI1 Adv. MTLS RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi1-advanced-final-client-test-plan' VARIANT='{"client_auth_type":"mtls"}' npm run test < /dev/null &


DESCRIPTION="openid-client v5.x FAPI 2.0 SP mtls, mtls (OIDC) RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi2-security-profile-id2-client-test-plan' VARIANT='{"client_auth_type":"mtls","sender_constrain":"mtls"}' npm run test < /dev/null &
DESCRIPTION="openid-client v5.x FAPI 2.0 SP private_key_jwt, mtls (OIDC) RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi2-security-profile-id2-client-test-plan' VARIANT='{"client_auth_type":"private_key_jwt","sender_constrain":"mtls"}' npm run test < /dev/null &

DESCRIPTION="openid-client v5.x FAPI 2.0 SP mtls, mtls (OAuth 2.0) RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi2-security-profile-id2-client-test-plan' VARIANT='{"client_auth_type":"mtls","sender_constrain":"mtls","fapi_client_type":"plain_oauth"}' npm run test < /dev/null &
DESCRIPTION="openid-client v5.x FAPI 2.0 SP private_key_jwt, mtls (OAuth 2.0) RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi2-security-profile-id2-client-test-plan' VARIANT='{"client_auth_type":"private_key_jwt","sender_constrain":"mtls","fapi_client_type":"plain_oauth"}' npm run test < /dev/null &

DESCRIPTION="openid-client v5.x FAPI 2.0 MS mtls, mtls (OIDC) RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi2-message-signing-id1-client-test-plan' VARIANT='{"client_auth_type":"mtls","sender_constrain":"mtls"}' npm run test < /dev/null &
DESCRIPTION="openid-client v5.x FAPI 2.0 MS private_key_jwt, mtls (OIDC) RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi2-message-signing-id1-client-test-plan' VARIANT='{"client_auth_type":"private_key_jwt","sender_constrain":"mtls"}' npm run test < /dev/null &

DESCRIPTION="openid-client v5.x FAPI 2.0 MS mtls, mtls (OAuth 2.0) RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi2-message-signing-id1-client-test-plan' VARIANT='{"client_auth_type":"mtls","sender_constrain":"mtls","fapi_client_type":"plain_oauth"}' npm run test < /dev/null &
DESCRIPTION="openid-client v5.x FAPI 2.0 MS private_key_jwt, mtls (OAuth 2.0) RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi2-message-signing-id1-client-test-plan' VARIANT='{"client_auth_type":"private_key_jwt","sender_constrain":"mtls","fapi_client_type":"plain_oauth"}' npm run test < /dev/null &

DESCRIPTION="openid-client v5.x FAPI 2.0 SP mtls, dpop (OIDC) RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi2-security-profile-id2-client-test-plan' VARIANT='{"client_auth_type":"mtls","sender_constrain":"dpop"}' npm run test < /dev/null &
DESCRIPTION="openid-client v5.x FAPI 2.0 SP private_key_jwt, dpop (OIDC) RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi2-security-profile-id2-client-test-plan' VARIANT='{"client_auth_type":"private_key_jwt","sender_constrain":"dpop"}' npm run test < /dev/null &

DESCRIPTION="openid-client v5.x FAPI 2.0 SP mtls, dpop (OAuth 2.0) RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi2-security-profile-id2-client-test-plan' VARIANT='{"client_auth_type":"mtls","sender_constrain":"dpop","fapi_client_type":"plain_oauth"}' npm run test < /dev/null &
DESCRIPTION="openid-client v5.x FAPI 2.0 SP private_key_jwt, dpop (OAuth 2.0) RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi2-security-profile-id2-client-test-plan' VARIANT='{"client_auth_type":"private_key_jwt","sender_constrain":"dpop","fapi_client_type":"plain_oauth"}' npm run test < /dev/null &

DESCRIPTION="openid-client v5.x FAPI 2.0 MS mtls, dpop (OIDC) RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi2-message-signing-id1-client-test-plan' VARIANT='{"client_auth_type":"mtls","sender_constrain":"dpop"}' npm run test < /dev/null &
DESCRIPTION="openid-client v5.x FAPI 2.0 MS private_key_jwt, dpop (OIDC) RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi2-message-signing-id1-client-test-plan' VARIANT='{"client_auth_type":"private_key_jwt","sender_constrain":"dpop"}' npm run test < /dev/null &

DESCRIPTION="openid-client v5.x FAPI 2.0 MS mtls, dpop (OAuth 2.0) RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi2-message-signing-id1-client-test-plan' VARIANT='{"client_auth_type":"mtls","sender_constrain":"dpop","fapi_client_type":"plain_oauth"}' npm run test < /dev/null &
DESCRIPTION="openid-client v5.x FAPI 2.0 MS private_key_jwt, dpop (OAuth 2.0) RP" DEBUG='runner,moduleId*' PLAN_NAME='fapi2-message-signing-id1-client-test-plan' VARIANT='{"client_auth_type":"private_key_jwt","sender_constrain":"dpop","fapi_client_type":"plain_oauth"}' npm run test < /dev/null &
```
