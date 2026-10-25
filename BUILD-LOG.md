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
9. Removed the create-next-app boilerplate: the starter home page, the default SVGs in `public/`, and the default README.
10. Added shadcn `input`, `label`, `card`, and `sonner` components, plus `react-hook-form` and `zod`. `@hookform/resolvers` needed `--legacy-peer-deps` because of an unrelated optional peer conflict.
11. Added auth: `src/lib/auth.ts` (React Query hooks `useCurrentUser`, `useLogin`, `useSignup`, `useLogout`), `src/lib/validators.ts` (zod schemas that mirror the backend rules, including the 18+ check), and the `/login` and `/signup` pages.
12. Added a protected `(app)` layout. It loads the current user from `/auth/me`, redirects to `/login` on a 401, and has a header with a Log out button. `/feed` is a placeholder.
13. Fixed the refresh rule in `api()`. Only `/auth/login`, `/auth/signup`, and `/auth/refresh` skip the refresh retry, so `/auth/me` does refresh.
14. Removed the landing page. `/` now redirects to `/feed` when logged in and to `/login` when not. Logged-in users visiting `/login` or `/signup` are sent to `/feed`.
15. UI redesign. Fonts: Space Grotesk (headings), Inter (body), JetBrains Mono (code-style accents), loaded with `next/font`. Glass cards and a soft background glow (`.text-gradient`, `.bg-brand`, `.glass` in `globals.css`). Added a `Logo` component, a glass sticky app header with an avatar, a welcome hero and quick-link cards on `/feed`, and taller inputs.
16. Switched to a light-first cyan theme (dark variables kept for a future theme toggle). Rebuilt login and signup in a rounded split card: brand panel (badge, "Good code. Great connections." headline, avatar card) plus a form with icon inputs, a show/hide password toggle, a terms checkbox, and a gradient button. Added `AuthField` and a new "S" logo. Brand colours are now CSS variables (`--brand-from`, `--brand-to`, `--glow-1`, `--glow-2`).
17. Headings and the logo now use the generic `sans-serif` font instead of Space Grotesk; Inter stays for body text. Made the page background slightly darker. Login and signup buttons are disabled until the form is valid, with pointer and not-allowed cursors.

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

