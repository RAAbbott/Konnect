import { getConnection } from "@/lib/db/connections";
import { fetchGmailDigest } from "@/lib/connectors/gmail";
import { fetchLinearDigest } from "@/lib/connectors/linear";
import { fetchNotionDigest } from "@/lib/connectors/notion";
import { fetchSlackDigest } from "@/lib/connectors/slack";
import { fetchTodoistDigest } from "@/lib/connectors/todoist";
import type { AggregatedSnapshot, ConnectorError } from "@/lib/connectors/types";

export async function buildSnapshot(): Promise<AggregatedSnapshot> {
  const errors: ConnectorError[] = [];
  const fetchedAt = new Date().toISOString();
  const out: AggregatedSnapshot = { fetchedAt, errors };

  const slack = await getConnection("slack");
  if (slack) {
    try {
      out.slack = await fetchSlackDigest(slack.accessToken);
    } catch (e) {
      errors.push({
        provider: "slack",
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  const linear = await getConnection("linear");
  if (linear) {
    try {
      out.linear = await fetchLinearDigest(linear.accessToken);
    } catch (e) {
      errors.push({
        provider: "linear",
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  const google = await getConnection("google");
  if (google) {
    try {
      out.gmail = await fetchGmailDigest(
        google.accessToken,
        google.refreshToken,
      );
    } catch (e) {
      errors.push({
        provider: "gmail",
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  const todoist = await getConnection("todoist");
  if (todoist) {
    try {
      out.todoist = await fetchTodoistDigest(todoist.accessToken);
    } catch (e) {
      errors.push({
        provider: "todoist",
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  const notion = await getConnection("notion");
  if (notion) {
    try {
      out.notion = await fetchNotionDigest(notion.accessToken);
    } catch (e) {
      errors.push({
        provider: "notion",
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return out;
}
