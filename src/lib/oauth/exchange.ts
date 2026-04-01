import { redirectUri, providerConfig } from "@/lib/oauth/providers";
import type { OAuthProvider } from "@/lib/env";

export type TokenResult = {
  accessToken: string;
  refreshToken?: string | null;
  expiresIn?: number;
  metadata?: Record<string, unknown>;
};

export async function exchangeCode(
  provider: OAuthProvider,
  code: string,
): Promise<TokenResult> {
  const cfg = providerConfig[provider];
  const { oauth } = await import("@/lib/env");
  const creds = oauth[provider];
  if (!creds.clientId || !creds.clientSecret) {
    throw new Error(`OAuth not configured for ${provider}`);
  }
  const redir = redirectUri(provider);

  switch (provider) {
    case "slack": {
      const body = new URLSearchParams({
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
        code,
        redirect_uri: redir,
      });
      const res = await fetch(cfg.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        access_token?: string;
        refresh_token?: string;
        team?: { id?: string; name?: string };
        authed_user?: { id?: string };
      };
      if (!data.ok || !data.access_token) {
        throw new Error(data.error ?? "Slack token exchange failed");
      }
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        metadata: {
          teamId: data.team?.id,
          teamName: data.team?.name,
          authedUserId: data.authed_user?.id,
        },
      };
    }
    case "linear": {
      const res = await fetch(cfg.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          client_id: creds.clientId,
          client_secret: creds.clientSecret,
          redirect_uri: redir,
          code,
        }),
      });
      const data = (await res.json()) as {
        access_token?: string;
        refresh_token?: string;
        expires_in?: number;
        error?: string;
      };
      if (!res.ok || !data.access_token) {
        throw new Error(data.error ?? "Linear token exchange failed");
      }
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      };
    }
    case "google": {
      const body = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
        redirect_uri: redir,
        code,
      });
      const res = await fetch(cfg.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const data = (await res.json()) as {
        access_token?: string;
        refresh_token?: string;
        expires_in?: number;
        error?: string;
      };
      if (!res.ok || !data.access_token) {
        throw new Error(data.error ?? "Google token exchange failed");
      }
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      };
    }
    case "todoist": {
      const body = new URLSearchParams({
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
        code,
        redirect_uri: redir,
      });
      const res = await fetch(cfg.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const data = (await res.json()) as {
        access_token?: string;
        error?: string;
        error_description?: string;
      };
      if (!res.ok || !data.access_token) {
        throw new Error(
          data.error_description ?? data.error ?? "Todoist token exchange failed",
        );
      }
      return { accessToken: data.access_token };
    }
    case "notion": {
      const basic = Buffer.from(
        `${creds.clientId}:${creds.clientSecret}`,
        "utf8",
      ).toString("base64");
      const res = await fetch(cfg.tokenUrl, {
        method: "POST",
        headers: {
          Authorization: `Basic ${basic}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code,
          redirect_uri: redir,
        }),
      });
      const data = (await res.json()) as {
        access_token?: string;
        refresh_token?: string;
        workspace_id?: string;
        workspace_name?: string;
        error?: string;
      };
      if (!res.ok || !data.access_token) {
        throw new Error(data.error ?? "Notion token exchange failed");
      }
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        metadata: {
          workspaceId: data.workspace_id,
          workspaceName: data.workspace_name,
        },
      };
    }
    default: {
      const _exhaustive: never = provider;
      return _exhaustive;
    }
  }
}
