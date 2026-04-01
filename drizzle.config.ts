import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

function drizzleDatabaseUrl(): string {
  const url =
    process.env.POSTGRES_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "Set DATABASE_URL or POSTGRES_URL in .env.local for drizzle-kit (same as Vercel Postgres).",
    );
  }
  return url;
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: drizzleDatabaseUrl(),
  },
});
