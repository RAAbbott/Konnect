import Link from "next/link";
import { listConnections } from "@/lib/db/connections";
import { DashboardClient } from "./dashboard-client";

const PROVIDERS = [
  {
    id: "slack" as const,
    name: "Slack",
    desc: "Workspace messages (search-based digest)",
  },
  {
    id: "linear" as const,
    name: "Linear",
    desc: "Issues assigned to you due today",
  },
  {
    id: "google" as const,
    name: "Gmail",
    desc: "Recent inbox mail (readonly)",
  },
  {
    id: "todoist" as const,
    name: "Todoist",
    desc: "Tasks (REST API)",
  },
  {
    id: "notion" as const,
    name: "Notion",
    desc: "Recently edited pages",
  },
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ oauth_error?: string; connected?: string }>;
}) {
  const sp = await searchParams;
  let connections: { provider: string }[] = [];
  let dbError: string | null = null;
  try {
    connections = await listConnections();
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Database unavailable";
  }

  const connected = new Set(connections.map((c) => c.provider));

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-12">
        {sp.oauth_error && (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100"
            role="alert"
          >
            OAuth error: {decodeURIComponent(sp.oauth_error)}
          </div>
        )}
        {sp.connected && !sp.oauth_error && (
          <div
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
            role="status"
          >
            Connected: <strong>{sp.connected}</strong>
          </div>
        )}
        <header className="space-y-2">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Konnect
          </p>
          <h1 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
            Your home base for Slack, Linear, Gmail, Todoist, and Notion
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Connect each service, pull a raw snapshot of data, then ask the AI
            for a morning briefing. This MVP focuses on OAuth and aggregation;
            richer UI can come later.
          </p>
        </header>

        {dbError && (
          <div
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
            role="status"
          >
            <strong className="font-medium">Database:</strong> {dbError}. Copy{" "}
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">
              .env.example
            </code>{" "}
            to{" "}
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">
              .env.local
            </code>
            , run{" "}
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">
              docker compose up -d
            </code>
            , then{" "}
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">
              npm run db:push
            </code>
            .
          </div>
        )}

        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Connections
          </h2>
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {PROVIDERS.map((p) => {
              const ok = connected.has(p.id);
              return (
                <li
                  key={p.id}
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-pretty text-sm text-zinc-500">{p.desc}</div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <span
                      className={
                        ok
                          ? "text-sm text-emerald-600 dark:text-emerald-400"
                          : "text-sm text-zinc-400"
                      }
                    >
                      {ok ? "Connected" : "Not connected"}
                    </span>
                    {!dbError && (
                      <Link
                        href={`/api/oauth/${p.id}`}
                        className="inline-flex min-h-11 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white active:bg-zinc-800 sm:min-h-0 sm:px-3 sm:py-1.5 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:active:bg-zinc-200"
                      >
                        {ok ? "Reconnect" : "Connect"}
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {!dbError && <DashboardClient />}
      </main>
    </div>
  );
}
