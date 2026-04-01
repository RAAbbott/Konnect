import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDatabaseConnectionUrl } from "./url";
import * as schema from "./schema";

let _client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  const url = getDatabaseConnectionUrl();
  if (!_db) {
    _client = postgres(url, { max: 10 });
    _db = drizzle(_client, { schema });
  }
  return _db;
}

export { schema };
