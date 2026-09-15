# Deploying SNOQ

## Backend on Render

Create a Node web service from the repository, setting its root directory to `server`. Use build command `npm install && npm run db:generate && npm run build` and start command `npm run start`. Before or during deployment run `npm run db:deploy` against Neon. Set every backend variable from `server/.env.example`, including `FRONTEND_URL`, `DATABASE_URL`, `JWT_SECRET`, Cloudinary values, `RESEND_API_KEY`, `EMAIL_FROM`, and `COOKIE_SECURE=true`. Never add an API key to the static-site environment.

Allow the exact Render static-site origin in `FRONTEND_URL`. The server uses credentialed CORS and HTTP-only cookies.

## Frontend on Render

Create a Static Site at root directory `client`, with build command `npm install && npm run build` and publish directory `dist`. Set `VITE_API_URL=https://YOUR-API.onrender.com/api`. Configure the SPA rewrite `/* → /index.html`; `render.yaml` contains both services as a starting point.

## Neon, Cloudinary, and OAuth

Use Neon PostgreSQL's production connection string and run `prisma migrate deploy` for releases. Put only Cloudinary object URLs and IDs in PostgreSQL; the binary stays in Cloudinary. Configure Google OAuth origins for the static-site URL and the matching token flow in your client integration.

## Provider switching and recovery

1. Configure Gemini with `GEMINI_API_KEY` and `GEMINI_MODEL`.
2. Configure OpenRouter separately with `OPENROUTER_API_KEY` and `OPENROUTER_MODEL`.
3. Select `AI_PRIMARY_PROVIDER=gemini` or `openrouter`.
4. Set `AI_FALLBACK_PROVIDER` to the other provider, or omit it to disable fallback.
5. Change a model by updating only that provider's model variable.
6. Rotate a provider key by replacing only that provider's key in Render and redeploying the API.
7. When Gemini quota runs out, leave it as primary with OpenRouter configured as fallback, or promote OpenRouter to primary. No frontend deployment is required.

Gemini and OpenRouter keys are provider-specific and cannot be swapped under a generic key name. The router reads selection and credentials separately, and its public status endpoint never returns secrets.
