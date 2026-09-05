# Mock Auth0

This adapter mirrors the basic Auth0 Next.js API without an SDK, tenant, or credentials.

- `/auth/login?returnTo=...` shows Alison, John, Maria, and Xavier.
- `/auth/callback?user=...&returnTo=...` accepts a fixed demo identity, sets a session cookie, and redirects back. The `user` parameter replaces a real OAuth authorization code.
- `/auth/logout?returnTo=...` clears the session and redirects back.
- `/auth/profile` returns the user, or `null` with HTTP 401 when anonymous. Responses are not cached.
- `auth0.getSession()` reads the session on the server and returns `{ user }` or `null`.
- `Auth0Provider` and `useUser()` expose the server-supplied user to client components. Full-page auth navigation refreshes that value; there is no separate client loading request.

The session cookie is HTTP-only, SameSite=Lax, Secure in production, and lasts for the browser session. It stores the selected demo ID directly. This deliberately simulates successful login; it does not verify identity or implement OAuth security.

Callback and logout use GET to match Auth0-style browser navigation. They are ordinary anchors/form submissions rather than prefetched Next.js links. Return destinations are restricted to `/` and article paths.

Replace this adapter with the real Auth0 SDK when connecting authentication. The registration meter is separate from the login session.
