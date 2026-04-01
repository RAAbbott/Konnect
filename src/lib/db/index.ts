import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let _client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your environment to use the database.",
    );
  }
  if (!_db) {
    _client = postgres(url, { max: 10 });
    _db = drizzle(_client, { schema });
  }
  return _db;
}

export { schema };
