import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildSnapshot } from "@/lib/aggregate";

export const runtime = "nodejs";

export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Set OPENAI_API_KEY to generate an AI briefing from your connected data.",
      },
      { status: 503 },
    );
  }
  let snapshot;
  try {
    snapshot = await buildSnapshot();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Snapshot failed";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const client = new OpenAI({ apiKey });
  const compact = JSON.stringify(snapshot, null, 0).slice(0, 120_000);

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a personal productivity assistant. Given JSON aggregated from the user's Slack, Linear, Gmail, Todoist, and Notion, produce a concise morning briefing:
- Unaddressed or notable Slack items (if present)
- Linear issues due today
- Important recent emails (summarize themes)
- Todoist tasks to focus on
- Notion pages that may need attention
If a section has no data, say so briefly. End with 3 suggested priorities for today.`,
      },
      {
        role: "user",
        content: compact,
      },
    ],
    temperature: 0.4,
  });

  const text = completion.choices[0]?.message?.content ?? "";
  return NextResponse.json({
    report: text,
    model: completion.model,
    snapshotErrors: snapshot.errors,
  });
}
