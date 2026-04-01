import type { SlackDigest } from "@/lib/connectors/types";

/**
 * Fetches recent messages the user may need to see (search across workspace).
 * Requires Slack OAuth scopes including search:read.
 */
export async function fetchSlackDigest(accessToken: string): Promise<SlackDigest> {
  const res = await fetch("https://slack.com/api/search.messages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      query: "is:unread",
      count: 15,
      sort: "timestamp",
      sort_dir: "desc",
    }),
  });
  const data = (await res.json()) as {
    ok?: boolean;
    error?: string;
    messages?: {
      matches?: {
        channel?: { name?: string };
        text?: string;
        ts?: string;
      }[];
    };
  };
  if (!data.ok) {
    throw new Error(data.error ?? "Slack API error");
  }
  const matches = data.messages?.matches ?? [];
  const unreadHighlights = matches.map((m) => ({
    channel: m.channel?.name,
    text: (m.text ?? "").replace(/<[^>]+>/g, "").slice(0, 500),
    ts: m.ts,
  }));
  return { unreadHighlights };
}
