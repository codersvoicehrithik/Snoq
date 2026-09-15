# SNOQ

SNOQ is a private AI-assisted library for URLs and documents. Paste a find, review the generated metadata, save it, then locate it again by title, description, category, or tag.

## What is included

- Email/password accounts with bcrypt hashing, server-issued HTTP-only session cookies, protected routes, and query scoping to the authenticated user.
- Google identity-token sign-in endpoint, enabled only when Google OAuth settings are configured.
- URL ingestion with URL normalization, duplicate detection, metadata extraction, SSRF guards, and a manual-save fallback.
- Cloudinary-backed document uploads. Temporary request buffers are never used as permanent storage.
- Gemini and OpenRouter adapters behind one `AIProvider` contract. The server selects a configured primary provider and tries one eligible fallback; the React client only receives normalized analysis data.
- Editable AI suggestions, local unsaved drafts, dashboard metrics/charts, search, favorites, archive/restore, and provider-safe settings status.

## Architecture

```text
SNOQ React/Vite static app → Express REST API → Prisma → Neon PostgreSQL
                              ├→ URL extraction → AI provider router → Gemini / OpenRouter
                              └→ Cloudinary document storage
```

The client is deployable as a Render Static Site. The Express app is a separate Render service. All secrets remain in backend environment variables.

## Project layout

- `client/` — React, Vite, TypeScript, Tailwind, React Router, TanStack Query, React Hook Form-ready UI, Recharts.
- `server/` — Express, TypeScript, Zod validation, Prisma, authentication, ingestion and provider adapters.
- `server/prisma/` — PostgreSQL schema, migration, and optional category seed.

## Getting started

See [SETUP.md](SETUP.md) for credentials, migrations, and local commands. Copy `server/.env.example` to `server/.env`, and `client/.env.example` to `client/.env.local`.

```bash
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

## Provider routing

Set `AI_PRIMARY_PROVIDER=gemini` and, optionally, `AI_FALLBACK_PROVIDER=openrouter`. Configure each provider's key and model independently. Rate limits, quota exhaustion, provider errors, timeouts, model errors, invalid responses, and credentials errors are eligible for one fallback attempt. Malformed requests are not retried blindly. If analysis is unavailable, the server returns manual-mode metadata and Save remains available.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

See [DEPLOY.md](DEPLOY.md) for Render, Neon, Cloudinary, OAuth, and provider switching. See [INTERVIEWS.md](INTERVIEWS.md) for implementation-specific discussion points.
