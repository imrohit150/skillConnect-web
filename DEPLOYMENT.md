# Frontend authentication on Vercel

Set the following project environment variable before the production build:

```env
BACKEND_ORIGIN=https://your-backend.onrender.com
```

Replace the example with your actual backend origin. Include no `/api/v1`,
credentials, query or fragment. Production configuration requires HTTPS.
Redeploy after changing this value because rewrites are generated from it.

Set the backend's `NODE_ENV=production` and `CLIENT_URL` to the exact frontend
origin, for example `https://your-frontend.vercel.app`, without a trailing slash.
Configure its verified `TRUST_PROXY_HOPS` for the complete proxy chain; see the
backend's `DEPLOYMENT.md`.

Production browser requests use `/api/v1/*` and `/socket.io` on the frontend's
own domain. Next.js rewrites forward them to the backend while retaining the
browser-facing URL. Host-only HttpOnly cookies are therefore first-party.
The existing `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL` settings are used
only in development; production does not connect directly to those origins.
Use the frontend domain consistently for login, signup and chat.

Hosted chat uses Socket.IO's HTTP long-polling transport, including server-pushed
messages, acknowledgements and reconnects. It does not attempt a WebSocket
upgrade through the HTTP rewrite. This makes more HTTP requests than a WebSocket
connection; account for those requests in the free hosting quotas. The browser's
socket path has no trailing slash and the rewrite adds the slash Engine.IO
expects upstream. Local development keeps direct WebSocket upgrade support.

Keep CDN caching disabled on both proxy paths. The backend marks API and socket
responses `private, no-store`, and the frontend REST client also disables caching.
Never put backend token secrets or provider API keys in frontend environment
variables. No tokens are copied into JavaScript or local storage by this setup.

Deployment checks are manual: signup OTP and resend, login, session refresh,
logout, password reset, and two-user chat with third-party cookies blocked.
These checks have not been run as part of this change.

References:

- [Next.js external rewrites](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites)
- [Vercel external rewrites](https://vercel.com/docs/routing/rewrites)
- [Socket.IO transport options](https://socket.io/docs/v4/client-options/)
