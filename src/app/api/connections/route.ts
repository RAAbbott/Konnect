import { NextResponse } from "next/server";
import { listConnections } from "@/lib/db/connections";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await listConnections();
    const safe = rows.map((r) => ({
      id: r.id,
      provider: r.provider,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      metadata: r.metadata,
    }));
    return NextResponse.json({ connections: safe });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database error";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
