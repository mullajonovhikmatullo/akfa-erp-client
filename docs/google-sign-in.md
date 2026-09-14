# Google sign-in

The store login uses Google's rendered Sign in with Google button. Telegram sign-in has been removed. The server verifies the Google ID token and issues the same Mavion session used by password sign-in.

## Configuration

1. Create an OAuth client with application type **Web application** in [Google Auth Platform](https://console.cloud.google.com/auth/clients). Configure the branding and audience. While the app is in testing, add the Google accounts that will test it to the allowed test users.
2. Add the exact website origins to **Authorized JavaScript origins**. Local development uses `http://localhost:5173`. If you open the app at `http://127.0.0.1:5173`, register that origin too; `localhost` and `127.0.0.1` are different origins. The repository's production configuration uses `https://mavion.uz` and `https://www.mavion.uz`; add both if both serve the login page, along with the exact Vercel domain if it serves the app. Origins must not include `/store` or another path. Add the bare `http://localhost` origin for local development as directed by Google's setup guide. The store dev server requires port `5173` and stops if it is occupied so it cannot silently switch to an unregistered origin.
3. Set `GOOGLE_CLIENT_ID` to that Web application's client ID in the server environment. Only the server needs this setting; the browser fetches the public ID from `GET /api/auth/google/config`. This implementation uses the GIS credential callback, so it requires no client secret or OAuth redirect endpoint.
4. In `shop-server`, install dependencies, build, and apply the `20260909120000_google_sign_in` migration using the project's normal migration deployment process. Restart the server after changing the environment. The Docker Compose configuration passes `GOOGLE_CLIENT_ID` to the backend; Render uses an environment variable with the same name.
5. Rebuild the store client. Its Nginx, Vite, and Vercel configurations allow the Google popup to communicate with the login page using `Cross-Origin-Opener-Policy: same-origin-allow-popups`. Both the combined Vercel deployment and the standalone store deployment include this header. If another proxy sets a Content Security Policy, allow the GIS script, frames, styles, and connections described in [Google's setup guide](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid).

Without a valid `GOOGLE_CLIENT_ID`, the login page shows that Google sign-in is unavailable and keeps password sign-in usable. An administrator configuration error is never reported as successful authentication.

## Troubleshooting

Check `GET /api/auth/google/config` on the same origin as the login page, for example `http://localhost:5173/api/auth/google/config`. The expected response contains `data.clientId` ending in `.apps.googleusercontent.com`. A `null` value means the backend serving that request has no valid `GOOGLE_CLIENT_ID`. Set the actual Web application's client ID in `shop-server/.env` for local development, or in the backend hosting environment for production, and restart that backend. The checked-in `.env.example` does not configure a running server, and setting a Vite environment variable does not configure the backend. No client secret is needed.

After correcting the backend configuration, use **Retry** below the Google button to fetch it again. Retry is also available when Google sign-in is disabled, without requiring a page reload.

If Google reports that an origin is not allowed, compare the browser's exact scheme, host, and port with the OAuth client's authorized JavaScript origins. Check the client ID belongs to a Web application. If the popup opens but cannot return to the page, inspect the login HTML response for the popup-compatible header above. API JSON response headers do not control the login document's popup behavior.

If Google verification succeeds but `POST /api/auth/google` fails, check the server response and confirm the `20260909120000_google_sign_in` migration has been applied. A `link_required` response is the expected first sign-in step: submit the existing Mavion username and password to establish the association.

## First sign-in and account linking

Existing Mavion users have usernames, not a verified Google identity. On the first Google sign-in, the form displays the Google-verified email and asks for the user's existing Mavion username and password. **Link account and sign in** explicitly confirms the association. Canceling clears the pending Google credential from component memory.

The server links the verified, stable Google `sub` to the existing user, with a unique database constraint. It never links accounts by matching an email address or creates a new store implicitly. One Mavion user can have one Google account; a Google account can belong to only one Mavion user. Linking is transactional, records an audit event, and revokes prior sessions by incrementing the user's authentication version.

Subsequent Google sign-ins use that association and enforce active-user, account-setup, store-access, and platform/store-role restrictions. Credentials remain in memory during linking; the browser does not persist Google tokens. Expired or invalid credentials require choosing the Google account again.

## Verification

The server's Google tests verify signed tokens against test certificates and reject invalid signatures, audiences, issuers, expiry, and unverified email addresses. They also cover linking, conflicting identities, disabled users, platform users, suspended stores, and concurrent account changes without connecting to a live database. Real Google consent additionally requires a configured client ID and an authorized Google test account.

See [Google's ID token verification guide](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token) for the identity-validation and legacy-account-linking model.
