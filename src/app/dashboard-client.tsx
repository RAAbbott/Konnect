"use client";

import { useCallback, useState } from "react";

export function DashboardClient() {
  const [snapshotJson, setSnapshotJson] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState<"snap" | "ai" | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const loadSnapshot = useCallback(async () => {
    setErr(null);
    setLoading("snap");
    try {
      const res = await fetch("/api/snapshot");
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Request failed");
        return;
      }
      setSnapshotJson(JSON.stringify(data, null, 2));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(null);
    }
  }, []);

  const loadReport = useCallback(async () => {
    setErr(null);
    setLoading("ai");
    try {
      const res = await fetch("/api/ai/report", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Request failed");
        return;
      }
      setReport(data.report ?? "");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(null);
    }
  }, []);

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
        Data &amp; AI
      </h2>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={loadSnapshot}
          disabled={loading !== null}
          className="min-h-11 w-full rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium hover:bg-zinc-50 active:bg-zinc-100 disabled:opacity-50 sm:min-h-0 sm:w-auto sm:px-3 sm:py-1.5 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:active:bg-zinc-800"
        >
          {loading === "snap" ? "Loading…" : "Fetch snapshot (JSON)"}
        </button>
        <button
          type="button"
          onClick={loadReport}
          disabled={loading !== null}
          className="min-h-11 w-full rounded-md bg-zinc-900 px-4 text-sm font-medium text-white active:bg-zinc-800 disabled:opacity-50 sm:min-h-0 sm:w-auto sm:px-3 sm:py-1.5 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:active:bg-zinc-200"
        >
          {loading === "ai" ? "Generating…" : "Generate AI briefing"}
        </button>
      </div>
      {err && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {err}
        </p>
      )}
      {report && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm leading-relaxed whitespace-pre-wrap dark:border-zinc-800 dark:bg-zinc-900">
          {report}
        </div>
      )}
      {snapshotJson && (
        <pre className="max-h-[min(70dvh,480px)] overflow-auto overscroll-contain rounded-lg border border-zinc-200 bg-zinc-100 p-3 text-xs sm:p-4 dark:border-zinc-800 dark:bg-zinc-950">
          {snapshotJson}
        </pre>
      )}
    </section>
  );
}
