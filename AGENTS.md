<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

### Overview

Konnect is a single Next.js 16 (App Router) application that aggregates data from Slack, Linear, Gmail, Todoist, and Notion via OAuth, stored in PostgreSQL via Drizzle ORM. See `README.md` for full setup steps and API routes.

### Services

| Service | How to start | Port |
|---|---|---|
| PostgreSQL 16 | `sudo docker compose up -d` | 5432 |
| Next.js dev server | `npm run dev` | 3000 |

After starting PostgreSQL for the first time (or after schema changes), push the Drizzle schema:

```
DATABASE_URL="postgresql://konnect:konnect@localhost:5432/konnect" npm run db:push
```

### Non-obvious caveats

- **Docker requires `sudo`** in the Cloud VM. Use `sudo docker compose up -d` and `sudo docker compose ps`.
- **`drizzle-kit` does not read `.env.local`** — you must pass `DATABASE_URL` as an env prefix when running `npm run db:push` or `npm run db:generate`.
- **OAuth providers and OpenAI are optional.** The app runs fully without them; the Connect buttons and AI briefing will return clear error messages about missing credentials.
- Standard commands: `npm run lint` (ESLint), `npm run build` (production build), `npm run dev` (dev server). See `package.json` scripts.
