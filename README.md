# Konnect

A small **home base** web app that connects to **Slack**, **Linear**, **Gmail** (Google), **Todoist**, and **Notion**, aggregates a snapshot of data from each, and can ask an **OpenAI** model for a daily briefing.

The MVP focuses on OAuth, token storage, and read-only pulls—not a polished UI.

## Stack

- **Next.js** (App Router) + **TypeScript** + **Tailwind**
- **PostgreSQL** via **Drizzle ORM** (`postgres` driver)
- **googleapis** (Gmail), **@notionhq/client** (Notion), REST for Slack / Linear / Todoist
- **OpenAI** API for `/api/ai/report`

## Setup

1. **Environment**

   ```bash
   cp .env.example .env.local
   ```

   Set `DATABASE_URL`, `APP_URL`, `APP_SECRET`, and each provider’s OAuth client ID and secret. See `.env.example` for variable names.

   Register OAuth redirect URLs as:

   `{APP_URL}/api/oauth/<provider>/callback`

   where `<provider>` is one of: `slack`, `linear`, `google`, `todoist`, `notion`.

2. **Database**

   Run Postgres (for example with Docker):

   ```bash
   docker compose up -d
   npm run db:push
   ```

3. **Run**

   ```bash
   npm install
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000), connect each service, then use **Fetch snapshot** or **Generate AI briefing**.

## API

| Route | Purpose |
| --- | --- |
| `GET /api/oauth/[provider]` | Start OAuth for `slack`, `linear`, `google`, `todoist`, `notion` |
| `GET /api/oauth/[provider]/callback` | OAuth callback (redirects home) |
| `GET /api/connections` | List connected providers (no tokens) |
| `GET /api/snapshot` | Aggregated JSON from all connected services |
| `POST /api/ai/report` | OpenAI briefing from the current snapshot |

## Notes

- **Slack** uses `search.messages` for a digest; tune scopes in `src/lib/oauth/providers.ts` if you need different data.
- **Gmail** requires the Gmail API enabled for your Google Cloud project and readonly scope.
- **Linear** lists issues **assigned to you** with **due date = today** (GraphQL).
- **Todoist** uses the REST v2 tasks endpoint.
- **Notion** searches recently edited pages the integration can access.

Tokens are stored in Postgres in plaintext in this MVP; encrypt at rest or use a vault before production.

## App Router vs Pages Router

Staying on the **App Router** is recommended. Moving to the **Pages Router** would be a **medium-sized refactor**, not a rewrite: you would recreate the same routes under `pages/api/*` and `pages/index.tsx`, replace `layout.tsx` with `_app` / `_document`, and adjust any App Router–specific APIs. Effort scales with how much you rely on App-only features (loading UI, nested layouts, React Server Components patterns). For this codebase, the API handlers and connector logic stay the same; mostly **file moves and import path updates**. Unless you have a strong reason to use Pages, **App Router is the better default** for new Next work.

## Deploying on Vercel (previews + staging DB)

**Preview deployments** get a stable URL per branch/PR (`VERCEL_URL`). This app uses `getAppUrl()` so **if `APP_URL` is unset**, OAuth redirect URIs use `https://<VERCEL_URL>` automatically—**each preview can OAuth against its own hostname** without listing every preview URL in provider consoles (you still register the **wildcard** patterns providers allow, e.g. `https://*.vercel.app/...` where supported).

**Single staging database for all previews** (what you asked for): point **every** Vercel environment (Preview + Production if you want) at **one** `DATABASE_URL` (e.g. [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres), [Neon](https://neon.tech), or [Supabase](https://supabase.com) Postgres). Set **`APP_SECRET` to the same value** everywhere so OAuth state verification works. Optionally set **`APP_URL`** to a **fixed staging hostname** (e.g. `https://konnect-staging.vercel.app`) if you want **one** redirect URL registered with Slack/Google/etc., and use that deployment for integration testing; previews would then need that same `APP_URL` if they share the DB—or accept that per-preview `VERCEL_URL` is used when `APP_URL` is unset (separate redirect URIs per preview).

**Practical MVP setup**

1. Create one Postgres instance; add `DATABASE_URL` to Vercel **Environment Variables** for Preview (and Production as needed).
2. Run **`npm run db:push`** once against that database from your machine (or add a migration step to CI) so the `connections` table exists.
3. Set **`APP_SECRET`**, **`OPENAI_API_KEY`**, and OAuth client IDs/secrets in Vercel (Preview at minimum).
4. In each OAuth provider, register redirect URLs. Either:
   - **Wildcard / multiple URLs**: e.g. `https://*.vercel.app/api/oauth/google/callback` if the provider supports it, or add your staging + production URLs explicitly; or  
   - **Per-preview OAuth**: rely on **`APP_URL` unset** so each preview uses its own `VERCEL_URL` and add patterns as your provider allows.

**Mobile:** the UI uses responsive spacing, full-width tap targets on small screens, `min-h-dvh`, and safe-area padding for notched phones. Test previews on a real device from the Vercel preview URL.
