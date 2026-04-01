import { NextResponse } from "next/server";
import type { OAuthProvider } from "@/lib/env";
import { upsertConnection } from "@/lib/db/connections";
import { exchangeCode } from "@/lib/oauth/exchange";
import { verifyOAuthState } from "@/lib/oauth/state";

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
  req: Request,
  ctx: { params: Promise<{ provider: string }> },
) {
  const { provider: raw } = await ctx.params;
  if (!isProvider(raw)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
  }
  const provider = raw;
  const url = new URL(req.url);
  const err = url.searchParams.get("error");
  if (err) {
    return NextResponse.redirect(
      new URL(`/?oauth_error=${encodeURIComponent(err)}`, req.url).toString(),
    );
  }
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/?oauth_error=missing_code", req.url).toString(),
    );
  }
  try {
    const payload = verifyOAuthState(state);
    if (payload.provider !== provider) {
      throw new Error("State mismatch");
    }
    const token = await exchangeCode(provider, code);
    const expiresAt =
      token.expiresIn != null
        ? new Date(Date.now() + token.expiresIn * 1000)
        : null;
    await upsertConnection({
      provider,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      expiresAt,
      metadata: token.metadata,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "oauth_failed";
    return NextResponse.redirect(
      new URL(`/?oauth_error=${encodeURIComponent(msg)}`, req.url).toString(),
    );
  }
  return NextResponse.redirect(new URL("/?connected=" + provider, req.url));
}
