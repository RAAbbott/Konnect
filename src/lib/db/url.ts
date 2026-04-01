/**
 * Resolves the Postgres connection string for Drizzle and `postgres.js`.
 *
 * - **Vercel Postgres** injects `POSTGRES_URL` (and related URLs) when Storage is linked.
 * - **Local dev** typically uses `DATABASE_URL` in `.env.local`.
 */
export function getDatabaseConnectionUrl(): string {
  const url =
    process.env.POSTGRES_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "Database URL not set. Locally: set DATABASE_URL in .env.local. On Vercel: create a Postgres database (Storage) and link it so POSTGRES_URL is available, or set DATABASE_URL manually.",
    );
  }
  return url;
}
