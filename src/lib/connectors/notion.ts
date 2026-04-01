import { Client } from "@notionhq/client";
import type { NotionDigest } from "@/lib/connectors/types";

export async function fetchNotionDigest(accessToken: string): Promise<NotionDigest> {
  const notion = new Client({ auth: accessToken });
  const search = await notion.search({
    page_size: 20,
    sort: { direction: "descending", timestamp: "last_edited_time" },
  });
  const pages: NotionDigest["pages"] = [];
  for (const r of search.results) {
    if (r.object !== "page") continue;
    let title = "Untitled";
    const props = "properties" in r ? r.properties : {};
    for (const v of Object.values(props)) {
      if (
        v.type === "title" &&
        "title" in v &&
        Array.isArray(v.title) &&
        v.title[0]?.plain_text
      ) {
        title = v.title.map((x) => x.plain_text).join("");
        break;
      }
    }
    pages.push({
      id: r.id,
      title,
      url: "url" in r && typeof r.url === "string" ? r.url : undefined,
      lastEdited:
        "last_edited_time" in r && r.last_edited_time
          ? String(r.last_edited_time)
          : undefined,
    });
  }
  return { pages };
}
