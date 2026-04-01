import { NextResponse } from "next/server";
import { oauth } from "@/lib/env";

/** OAuth start can be slow on cold starts; allow room on Vercel (plan limits apply). */
export const maxDuration = 60;
import type { OAuthProvider } from "@/lib/env";
import { providerConfig, redirectUri } from "@/lib/oauth/providers";
import { signOAuthState } from "@/lib/oauth/state";

const PROVIDERS: OAuthProvider[] = [
  "slack",
  "linear",
  "google",
  "todoist",
  "notion",
];

function isProvider(s: string): s is OAuthProvider {
  return (PROVIDERS as string[]).includes(s);
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ provider: string }> },
) {
  const { provider: raw } = await ctx.params;
  if (!isProvider(raw)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
  }
  const provider = raw;
  const creds = oauth[provider];
  if (!creds.clientId || !creds.clientSecret) {
    return NextResponse.json(
      {
        error: `OAuth not configured for ${provider}. Set ${provider.toUpperCase()}_CLIENT_ID and secret in .env.`,
      },
      { status: 503 },
    );
  }

  const cfg = providerConfig[provider];
  const state = signOAuthState({
    exp: Date.now() + 15 * 60 * 1000,
    provider,
  });

  const url = new URL(cfg.authorizeUrl);
  const redir = redirectUri(provider);

  switch (provider) {
    case "slack":
      url.searchParams.set("client_id", creds.clientId);
      url.searchParams.set("scope", cfg.scopes.join(","));
      url.searchParams.set("redirect_uri", redir);
      url.searchParams.set("state", state);
      break;
    case "linear":
      url.searchParams.set("client_id", creds.clientId);
      url.searchParams.set("redirect_uri", redir);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("scope", cfg.scopes.join(" "));
      url.searchParams.set("state", state);
      url.searchParams.set("prompt", "consent");
      break;
    case "google":
      url.searchParams.set("client_id", creds.clientId);
      url.searchParams.set("redirect_uri", redir);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("scope", cfg.scopes.join(" "));
      url.searchParams.set("access_type", "offline");
      url.searchParams.set("prompt", "consent");
      url.searchParams.set("state", state);
      break;
    case "todoist":
      url.searchParams.set("client_id", creds.clientId);
      url.searchParams.set("scope", cfg.scopes.join(","));
      url.searchParams.set("state", state);
      url.searchParams.set("redirect_uri", redir);
      break;
    case "notion":
      url.searchParams.set("client_id", creds.clientId);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("owner", "user");
      url.searchParams.set("redirect_uri", redir);
      url.searchParams.set("state", state);
      break;
    default: {
      const _e: never = provider;
      return _e;
    }
  }

  return NextResponse.redirect(url.toString());
}
