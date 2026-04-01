import { asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/index";
import type { OAuthProvider } from "@/lib/env";

export async function upsertConnection(input: {
  provider: OAuthProvider;
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: Date | null;
  metadata?: Record<string, unknown>;
}) {
  const db = getDb();
  const existing = await db
    .select()
    .from(schema.connections)
    .where(eq(schema.connections.provider, input.provider))
    .limit(1);

  const row = existing[0];
  if (row) {
    await db
      .update(schema.connections)
      .set({
        accessToken: input.accessToken,
        refreshToken: input.refreshToken ?? row.refreshToken,
        expiresAt: input.expiresAt ?? row.expiresAt,
        metadata: input.metadata ?? row.metadata ?? {},
        updatedAt: new Date(),
      })
      .where(eq(schema.connections.id, row.id));
    return row.id;
  }
  const inserted = await db
    .insert(schema.connections)
    .values({
      provider: input.provider,
      accessToken: input.accessToken,
      refreshToken: input.refreshToken,
      expiresAt: input.expiresAt ?? null,
      metadata: input.metadata ?? {},
    })
    .returning({ id: schema.connections.id });
  return inserted[0]!.id;
}

export async function listConnections() {
  const db = getDb();
  return db
    .select()
    .from(schema.connections)
    .orderBy(asc(schema.connections.provider));
}

export async function getConnection(provider: OAuthProvider) {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.connections)
    .where(eq(schema.connections.provider, provider))
    .limit(1);
  return rows[0] ?? null;
}
