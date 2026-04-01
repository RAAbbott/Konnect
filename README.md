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

   Set `DATABASE_URL` (or `POSTGRES_URL` on Vercel), `APP_SECRET`, and each provider’s OAuth client ID and secret. See `.env.example` and **OAuth apps** below.

   Register OAuth redirect URLs as:

   `{public-origin}/api/oauth/<provider>/callback`

   where `<provider>` is one of: `slack`, `linear`, `google`, `todoist`, `notion`, and `public-origin` is your app URL (local, production, or each preview—see Vercel section).

2. **Database**

   **Local:** Docker:

   ```bash
   docker compose up -d
   npm run db:push
   ```

   The app and Drizzle resolve the connection string in this order: **`POSTGRES_URL`** → **`POSTGRES_PRISMA_URL`** → **`DATABASE_URL`** (so [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) works without renaming variables).

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

## Deploying on Vercel (Postgres + previews)

This repo includes a minimal **`vercel.json`** (framework hint). API routes that call external services use **`maxDuration`** (60s) where needed for cold starts and OpenAI.

### Vercel Postgres

1. In the [Vercel dashboard](https://vercel.com): your project → **Storage** → **Create** → **Postgres** (or attach an existing database).
2. **Link** the database to this project. Vercel injects **`POSTGRES_URL`** (and related vars) into the deployment environment.
3. Redeploy so the new env vars apply.
4. **Schema (one time):** from your machine, copy `POSTGRES_URL` from the Vercel project’s environment (or use **`vercel env pull .env.local`**) so `.env.local` contains the connection string, then run:

   ```bash
   npm run db:push
   ```

   Use the same command after schema changes.

### Preview vs production and one shared database

- **Shared DB across Preview + Production:** In the Vercel project settings, ensure the **same** `POSTGRES_URL` (or linked Storage) is available for **Preview** and **Production** if you want one database for everything. `APP_SECRET` must be **identical** on every environment that shares that database.
- **OAuth base URL:** If **`APP_URL` is unset**, the app uses **`https://${VERCEL_URL}`**, so **each preview deployment** has its own origin. Register redirect URLs in each provider for:
  - `https://<your-production-domain>/api/oauth/.../callback`, and
  - Either wildcard patterns (where supported, e.g. `*.vercel.app`) or add specific preview URLs as you use them.
- **Single canonical URL for OAuth:** Set **`APP_URL`** in Vercel (e.g. `https://konnect.vercel.app`) on **Preview and Production** if you want every deployment to use **one** redirect URI. Then register only that origin’s `/api/oauth/.../callback` URLs in Slack, Google, etc.

### Environment variables on Vercel

Add the same OAuth and app secrets for **Preview** and **Production** (and Development if you use `vercel dev`):

| Variable | Notes |
| --- | --- |
| `POSTGRES_URL` | Usually automatic when Vercel Postgres is linked |
| `APP_SECRET` | Long random string; **same** wherever the same DB is used |
| `APP_URL` | Optional; omit to use `VERCEL_URL` per deployment |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | For `/api/ai/report` |
| `SLACK_*`, `LINEAR_*`, `GOOGLE_*`, `TODOIST_*`, `NOTION_*` | From each provider’s developer console |

**CLI (optional):** Install the [Vercel CLI](https://vercel.com/docs/cli), run `vercel link` in the repo, then:

- **`vercel env pull .env.local`** — download env vars from the linked project into `.env.local` (good for local `db:push` against the cloud DB).
- Adding secrets is easiest via the **Vercel dashboard** → Project → **Settings** → **Environment Variables**, or `vercel env add` for each key and environment.

There is no safe way for this repository to **push** your local `.env` to Vercel without your logged-in CLI; use the dashboard or `vercel env add` after filling `.env.local`.

### OAuth apps (where to get client ID and secret)

Create one app per provider and set **Authorized redirect URI** to:

`{your-public-origin}/api/oauth/<provider>/callback`

| Provider | Where to create the app |
| --- | --- |
| **Slack** | [api.slack.com/apps](https://api.slack.com/apps) → **OAuth & Permissions** → redirect URLs |
| **Linear** | [linear.app/settings/api](https://linear.app/settings/api) → OAuth applications |
| **Google (Gmail)** | [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → OAuth 2.0 Client ID (Web application). Enable **Gmail API** for the project. Redirect: `.../api/oauth/google/callback` |
| **Todoist** | [Todoist App Management](https://app.todoist.com/app/settings/integrations/app-management) |
| **Notion** | [notion.so/my-integrations](https://www.notion.so/my-integrations) |

**Mobile:** the UI uses responsive spacing, full-width tap targets on small screens, `min-h-dvh`, and safe-area padding for notched phones. Test previews on a real device from the Vercel preview URL.
