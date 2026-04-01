import { getAppUrl } from "@/lib/env";
import type { OAuthProvider } from "@/lib/env";

const appUrl = () => getAppUrl().replace(/\/$/, "");

export function redirectUri(provider: OAuthProvider): string {
  return `${appUrl()}/api/oauth/${provider}/callback`;
}

export const providerConfig: Record<
  OAuthProvider,
  {
    authorizeUrl: string;
    tokenUrl: string;
    scopes: string[];
    /** Use PKCE (Todoist requires it) */
    usePkce?: boolean;
  }
> = {
  slack: {
    authorizeUrl: "https://slack.com/oauth/v2/authorize",
    tokenUrl: "https://slack.com/api/oauth.v2.access",
    scopes: [
      "channels:history",
      "channels:read",
      "groups:history",
      "groups:read",
      "im:history",
      "im:read",
      "mpim:history",
      "mpim:read",
      "users:read",
      "search:read",
    ],
  },
  linear: {
    authorizeUrl: "https://linear.app/oauth/authorize",
    tokenUrl: "https://api.linear.app/oauth/token",
    scopes: ["read", "write", "issues:create", "comments:create"],
  },
  google: {
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: [
      "openid",
      "email",
      "https://www.googleapis.com/auth/gmail.readonly",
    ],
  },
  todoist: {
    authorizeUrl: "https://app.todoist.com/oauth/authorize",
    tokenUrl: "https://api.todoist.com/oauth/access_token",
    scopes: ["data:read_write"],
  },
  notion: {
    authorizeUrl: "https://api.notion.com/v1/oauth/authorize",
    tokenUrl: "https://api.notion.com/v1/oauth/token",
    scopes: [], // Notion uses capability during app setup
  },
};
