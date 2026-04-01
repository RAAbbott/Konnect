import type { LinearDigest } from "@/lib/connectors/types";

function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function fetchLinearDigest(accessToken: string): Promise<LinearDigest> {
  const query = `
    query AssignedWithDue {
      viewer {
        assignedIssues(first: 100, includeArchived: false) {
          nodes {
            id
            title
            url
            dueDate
          }
        }
      }
    }
  `;
  const res = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  const body = (await res.json()) as {
    data?: {
      viewer?: {
        assignedIssues?: {
          nodes: LinearDigest["issuesDueToday"];
        };
      };
    };
    errors?: { message: string }[];
  };
  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join("; "));
  }
  const nodes = body.data?.viewer?.assignedIssues?.nodes ?? [];
  const day = todayIsoDate();
  const issuesDueToday = nodes.filter((n) => {
    if (!n.dueDate) return false;
    const d = String(n.dueDate).slice(0, 10);
    return d === day;
  });
  return { issuesDueToday };
}
