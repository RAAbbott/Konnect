/**
 * Canonical public URL for OAuth redirects and absolute links.
 * - Prefer `APP_URL` when set (production or explicit preview URL).
 * - On Vercel, `VERCEL_URL` is set per deployment (e.g. `*.vercel.app`); use it when
 *   `APP_URL` is unset so preview deployments get correct OAuth redirects without
 *   manual env per branch. For a single staging hostname, set `APP_URL` in Vercel
 *   to that URL instead.
 */
export function getAppUrl(): string {
  const explicit = process.env.APP_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }
  return "http://localhost:3000";
}

export function getEncryptionKey(): string | undefined {
  return process.env.ENCRYPTION_KEY;
}

export function getOpenAIApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY;
}

/** OAuth client IDs and secrets (set per provider in .env) */
export const oauth = {
  slack: {
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
  },
  linear: {
    clientId: process.env.LINEAR_CLIENT_ID,
    clientSecret: process.env.LINEAR_CLIENT_SECRET,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  todoist: {
    clientId: process.env.TODOIST_CLIENT_ID,
    clientSecret: process.env.TODOIST_CLIENT_SECRET,
  },
  notion: {
    clientId: process.env.NOTION_CLIENT_ID,
    clientSecret: process.env.NOTION_CLIENT_SECRET,
  },
} as const;

export type OAuthProvider = keyof typeof oauth;
