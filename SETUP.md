# SNOQ local setup

## Prerequisites

Use Node 22 LTS, a Neon PostgreSQL database, Cloudinary account, and optionally Gemini, OpenRouter, and Google OAuth credentials. The client has no secret environment variables.

## Install and configure

1. Run `npm install` in the repository root.
2. Copy `server/.env.example` to `server/.env`. Use a Neon pooled PostgreSQL `DATABASE_URL`; create a unique random `JWT_SECRET` of at least 32 characters.
3. Copy `client/.env.example` to `client/.env.local`. It contains only public Vite build-time values such as `VITE_API_URL`.
4. Run `npm run db:generate`, then `npm run db:migrate`. To create the starter category set, run `npm run db:seed`.
5. Start both services with `npm run dev`. The client runs on port 5173 and the API on port 4000.

## External services

**Neon:** create a database and paste its connection string into `DATABASE_URL`. Do not use a local SQLite database for production.

**Cloudinary:** add cloud name, API key, API secret, and optionally change `CLOUDINARY_FOLDER` or `CLOUDINARY_AVATAR_FOLDER`. Documents upload to `resource-vault/documents` by default; profile photos use `snoq/avatars`. SNOQ enforces the Free plan's 10 MB raw-document limit and rejects profile photos above 25 megapixels; avatar uploads are additionally capped at 2 MB.

**Resend:** create an API key and verify a sending domain in Resend. Set `RESEND_API_KEY` and `EMAIL_FROM` in `server/.env`, for example `SNOQ <noreply@yourdomain.com>`. Password reset links expire after 30 minutes and are sent only by the backend.

**Gemini / OpenRouter:** set models independently and only provide a key to the provider you intend to use. AI analysis is optional; a missing provider opens manual mode.

**Google OAuth:** create a web OAuth client. Add `http://localhost:5173` as an authorized origin and configure the browser Google Identity SDK to submit its credential to `POST /api/auth/google`. Set the client ID server-side. The endpoint verifies the identity token before creating a session.

## Troubleshooting

- `PrismaClientInitializationError`: recheck `DATABASE_URL`, IP/SSL configuration, and run `npm run db:generate`.
- CORS/session problems: ensure `FRONTEND_URL` is the exact browser origin. For HTTPS deployment set `COOKIE_SECURE=true`.
- AI shows manual mode: inspect only server logs, then add the matching provider key/model. Provider keys are not interchangeable.
- Cloudinary upload fails: confirm all three Cloudinary credentials and folder access; file size is limited to 15 MB.
