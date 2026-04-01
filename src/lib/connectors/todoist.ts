import type { TodoistDigest } from "@/lib/connectors/types";

export async function fetchTodoistDigest(
  accessToken: string,
): Promise<TodoistDigest> {
  const res = await fetch("https://api.todoist.com/rest/v2/tasks", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `Todoist ${res.status}`);
  }
  const tasks = (await res.json()) as {
    id: string;
    content: string;
    due?: { date?: string; datetime?: string } | null;
    project_id?: string;
    priority?: number;
  }[];
  const today = new Date().toISOString().slice(0, 10);
  const filtered = tasks.filter((t) => {
    const d = t.due?.datetime ?? t.due?.date;
    if (!d) return true;
    return d.slice(0, 10) <= today;
  });
  return {
    tasks: filtered.slice(0, 50).map((t) => ({
      id: t.id,
      content: t.content,
      due: t.due?.datetime ?? t.due?.date ?? null,
      projectId: t.project_id,
      priority: t.priority,
    })),
  };
}
