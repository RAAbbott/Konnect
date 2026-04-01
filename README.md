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
