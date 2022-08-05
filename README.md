```
DESCRIPTION="openid-client v5.x Basic RP" PLAN_NAME='oidcc-client-basic-certification-test-plan' DEBUG='runner,moduleId*' npm run test < /dev/null &
DESCRIPTION="openid-client v5.x Implicit RP" PLAN_NAME='oidcc-client-implicit-certification-test-plan' DEBUG='runner,moduleId*' npm run test < /dev/null &
DESCRIPTION="openid-client v5.x Hybrid RP" PLAN_NAME='oidcc-client-hybrid-certification-test-plan' DEBUG='runner,moduleId*' npm run test < /dev/null &
DESCRIPTION="openid-client v5.x Config RP" PLAN_NAME='oidcc-client-config-certification-test-plan' DEBUG='runner,moduleId*' npm run test < /dev/null &
DESCRIPTION="openid-client v5.x Dynamic RP" PLAN_NAME='oidcc-client-dynamic-certification-test-plan' DEBUG='runner,moduleId*' npm run test < /dev/null &

DESCRIPTION="openid-client v5.x FAPI1 RW ID-2 private_key_jwt RP" PLAN_NAME='fapi-rw-id2-client-test-plan' DEBUG='runner,moduleId*' npm run test < /dev/null &
DESCRIPTION="openid-client v5.x FAPI1 RW ID-2 MTLS RP" PLAN_NAME='fapi-rw-id2-client-test-plan' DEBUG='runner,moduleId*' VARIANT='{"client_auth_type":"mtls"}' npm run test < /dev/null &

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
```
