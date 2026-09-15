# SNOQ interview notes

## Architecture

**Why React/Vite and Express?** Vite produces a static bundle suitable for Render Static Sites, while Express keeps authentication, external API calls, and secrets in an independently deployable backend. REST is sufficient for the resource CRUD and ingestion workflow; microservices would add operational cost without helping V1.

**Why Neon, PostgreSQL, and Prisma?** PostgreSQL supports durable relational ownership, relationships between resources/tags/categories, and a path to full-text search and later pgvector. Neon provides managed serverless PostgreSQL. Prisma gives typed migrations and query access.

**Why Cloudinary?** Render disks are ephemeral. PostgreSQL keeps document metadata and Cloudinary persists the binary independently of API instances.

## Authentication and isolation

Passwords are bcrypt-hashed. The API signs an HTTP-only seven-day cookie and derives `userId` from its verified JWT, never from the request body. Every resource service query contains `userId`; a guessed resource ID cannot cross the ownership boundary. Google identity tokens are verified through Google's library before the same session is issued.

## AI design

`AIProvider` isolates provider contracts. `GeminiProvider` and `OpenRouterProvider` both accept extracted context and return the same Zod-validated analysis schema. The router calls one configured primary, classifies the error, and makes at most one fallback call. Quota, 429, upstream error, timeout, model unavailability, provider auth failure, and invalid output may use fallback; malformed application requests do not. If both fail, the analysis endpoint returns manual-mode fields and the resource can still be saved.

Adding a third provider requires its adapter, environment config, and registration in the provider registry; URL extraction, resource CRUD, and the client do not change. Prompts request JSON only, context is capped, and Zod rejects malformed/provider-specific output.

## Ingestion and security

The API extracts Open Graph, canonical URL, favicon, author, visible text, and basic metadata before AI. This reduces hallucination and avoids giving an AI arbitrary browsing authority. The fetcher rejects non-HTTP(S), localhost, private IPv4 ranges, common private IPv6 ranges, and revalidates redirects. It caps response size and redirects.

Document uploads use memory only during processing, validate size and practical MIME/extension formats, never execute files, then upload to Cloudinary. Unsupported formats can remain a future manual-only upload path; V1 does not claim to analyze arbitrary binary data.

## Search and scale

V1 uses case-insensitive fields and tag/category matching, scoped to each user. Production evolution should add weighted PostgreSQL `tsvector` plus `pg_trgm` indexes, then optionally pgvector hybrid retrieval without a new database service. At 100,000 users, add pagination, async ingestion jobs, per-provider rate limits, queue-backed document extraction, cache duplicate analysis by normalized URL/content hash, and tighter observability.

If providers become expensive, limit context, deduplicate requests, rate-limit reanalysis, choose less expensive configured models, and only call AI when the user explicitly requests it. Provider outages do not block the core save workflow.
