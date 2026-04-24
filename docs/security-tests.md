# Security Test Pack

## CSRF

1. Login and confirm `pg_csrf` cookie exists.
2. Send state-changing API request without `X-CSRF-Token`.
3. Expect `403 Invalid CSRF token`.
4. Send same request with valid header from cookie.
5. Expect success.

## Origin Validation

1. Send cookie-auth state-changing request with invalid `Origin`.
2. Expect `403 Invalid request origin`.
3. Repeat with allowed origin.
4. Expect success.

## Webhook Signature

1. POST Meta webhook payload with invalid signature.
2. Expect `403`.
3. POST Razorpay webhook payload with invalid signature.
4. Expect `400`.

## Plan Contract

1. Free user creates 6th automation rule.
2. Expect `403 Rule limit reached`.
3. Free user reaches 500 contacts, then new contact trigger.
4. Expect `403 Free plan contact limit reached`.

## Rate Limiting

1. Burst invalid login requests.
2. Expect `429` after threshold.

## Session Cookies

1. Verify auth/admin cookies are `HttpOnly`.
2. Verify `Secure` in production.
3. Verify logout clears auth and CSRF cookies.
