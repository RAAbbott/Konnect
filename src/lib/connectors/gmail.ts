import { google } from "googleapis";
import type { GmailDigest } from "@/lib/connectors/types";

export async function fetchGmailDigest(
  accessToken: string,
  refreshToken?: string | null,
): Promise<GmailDigest> {
  const oauth2 = new google.auth.OAuth2();
  oauth2.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken ?? undefined,
  });
  const gmail = google.gmail({ version: "v1", auth: oauth2 });
  const list = await gmail.users.messages.list({
    userId: "me",
    maxResults: 15,
    q: "in:inbox newer_than:1d",
  });
  const ids = list.data.messages?.map((m) => m.id).filter(Boolean) ?? [];
  const messages: GmailDigest["messages"] = [];
  for (const id of ids.slice(0, 15)) {
    const msg = await gmail.users.messages.get({
      userId: "me",
      id: id!,
      format: "metadata",
      metadataHeaders: ["Subject", "From"],
    });
    const headers = msg.data.payload?.headers ?? [];
    const subject =
      headers.find((h) => h.name?.toLowerCase() === "subject")?.value ?? "";
    const from =
      headers.find((h) => h.name?.toLowerCase() === "from")?.value ?? "";
    messages.push({
      id: id!,
      subject,
      from,
      snippet: msg.data.snippet ?? "",
    });
  }
  return { messages };
}
