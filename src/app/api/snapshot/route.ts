import { NextResponse } from "next/server";
import { buildSnapshot } from "@/lib/aggregate";

export const runtime = "nodejs";

export const maxDuration = 60;

export async function GET() {
  try {
    const snapshot = await buildSnapshot();
    return NextResponse.json(snapshot);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to build snapshot";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
