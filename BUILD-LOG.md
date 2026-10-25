# SkillConnect Web Build Log

Frontend for SkillConnect. The backend lives in the separate `skillConnect-backend` repo.

## Stack

- Next.js (App Router, `src/` directory), React, TypeScript
- Tailwind CSS and shadcn/ui
- TanStack React Query for API state
- Socket.IO Client for chat

## Log

1. Created the Next.js app with TypeScript, Tailwind, ESLint, the App Router, and the `@/*` import alias. The folder is lowercase because npm package names cannot contain capitals.
2. Initialised shadcn/ui, which added the `Button` component and the `cn` helper in `src/lib/utils.ts`.
3. Installed `@tanstack/react-query`, its devtools, and `socket.io-client`.
4. Added `src/components/providers.tsx`, which wraps the app in a React Query provider with sensible defaults, and wired it into the root layout.
5. Added `src/lib/api.ts`, a fetch wrapper that sends cookies (`credentials: "include"`) and throws a typed `ApiError`.
6. Added `.env.example` with `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL`, and updated `.gitignore` so it is tracked while real env files stay ignored.
7. Lint and build pass. The first push went to `main`.
8. `api()` now refreshes the session automatically: on a 401 it calls `POST /auth/refresh` once (shared across parallel requests) and retries the original request. `/auth/*` paths are excluded to avoid loops.

## Setup notes

- Copy `.env.example` to `.env.local`.
- Set `CLIENT_URL=http://localhost:3000` in the backend `.env` so CORS allows this app.

## Next

- Auth pages (signup, login) and a current-user query that powers a protected layout.
- Developer directory and profile pages.
- Connection requests and the connections list.
- Real-time chat with Socket.IO.
- Premium subscription screen with Razorpay Checkout. Premium must only come from the backend's verify result.
- Landing page and a "Coming Soon" video-call UI.
