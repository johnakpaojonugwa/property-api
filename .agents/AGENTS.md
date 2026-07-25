# Core API & Security Practices

Whenever building code, APIs, and microservices for this project, strictly observe the following core practices and security patterns:

## API Best Practices

1. **Name endpoints after resources, not actions**: Use noun-based URI paths representing resources (e.g., `/users`, `/properties`) instead of action-based paths.
2. **Version APIs**: Always prefix API routes with versioning (e.g., `/v1/`).
3. **Paginate large collections**: Implement pagination for list endpoints returning data sets.
4. **Support filtering and sorting via query params**: Use standard query parameters for filtering, sorting, and pagination rather than custom endpoints.
5. **Use meaningful status codes**: Return accurate HTTP status codes matching the result of the operation (200, 201, 204, 400, 401, 403, 404, 409, 422, 500).
6. **Standardize error responses**: Ensure every error response shares one predictable, standardized schema across the API.
7. **Make writes idempotent**: Ensure repeat identical requests produce a single consistent result without creating unintended duplicate resources.
8. **Rate limit & throttle**: Protect APIs from abuse with per-client rate limits and throttling mechanisms.
9. **Authenticate properly**: Secure endpoints using OAuth 2.0 or signed API keys/tokens—never transmit or store plaintext credentials.
10. **Cache with ETags**: Support conditional requests and ETags so clients can skip re-downloading unchanged data.
11. **Validate every request**: Enforce strict schema-based input validation and reject malformed input early with clear feedback.
12. **Stay backward-compatible**: Allow additive schema changes, but never remove or alter fields that existing clients depend on.
13. **Front APIs with a gateway**: Centralize authentication, rate limiting, logging, and routing.
14. **Use webhooks for events**: Push real-time event updates to clients instead of requiring constant polling.
15. **Handle long jobs async**: For long-running operations, return a job/task ID immediately and allow clients to poll or receive notifications.
16. **Document with OpenAPI**: Maintain accurate, comprehensive OpenAPI (Swagger) specifications for all endpoints.
17. **Use a responsive envelope**: Standardize API response wrappers using `{ success, data, message, errors }` or `{ data, meta, error }`.
18. **Apply least privilege**: Ensure every access token and permission scope is granted only the minimum required access.

## Best Security Patterns

1. **OAuth 2.0**: Allow applications limited access on behalf of users without exposing credentials.
2. **JWT**: Use cryptographically signed tokens to store and verify identity efficiently.
3. **Zero trust**: Explicitly verify every incoming request regardless of network boundary.
4. **Multi-Factor Auth (MFA)**: Support multi-factor authentication for sensitive access and identity verification.
5. **Least privilege**: Grant every system identity, service, and user only the exact permissions needed for their role.
6. **Secrets management**: Store credentials and secrets in environment variables or vaults—never hardcode secrets in source code.
7. **Input validation & sanitization**: Validate and sanitize all incoming data before executing business logic or queries.
8. **TLS everywhere**: Enforce TLS encryption across all network communication hops.
9. **CSRF protection**: Guard web interfaces with anti-CSRF protections and secure cookie flags.
10. **CORS boundaries**: Explicitly configure CORS policies to allow only trusted origins.
11. **SQL / NoSQL injection prevention**: Use parameterized queries, ORM/ODM abstractions, and sanitized inputs.
12. **Password hashing**: Store passwords using strong, adaptive one-way hashing algorithms (e.g., bcrypt, Argon2).
13. **Brute-force protection**: Throttle and lock out repetitive failed authentication attempts.
14. **Token expiry & rotation**: Use short-lived access tokens and refresh token rotation to minimize token exposure.
15. **Audit logging**: Record structured audit logs of actions and events to ensure complete traceability.
