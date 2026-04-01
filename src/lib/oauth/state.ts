import { createHmac, timingSafeEqual } from "crypto";

function getSecret(): string {
  const s =
    process.env.APP_SECRET ?? process.env.ENCRYPTION_KEY ?? process.env.AUTH_SECRET;
  if (!s) {
    throw new Error(
      "Set APP_SECRET (or ENCRYPTION_KEY) to secure OAuth state tokens.",
    );
  }
  return s;
}

function b64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromB64url(s: string): Buffer {
  const pad = 4 - (s.length % 4 || 4);
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(pad % 4);
  return Buffer.from(b64, "base64");
}

export function signOAuthState(payload: Record<string, unknown>): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8");
  const sig = createHmac("sha256", getSecret()).update(body).digest();
  return `${b64url(body)}.${b64url(sig)}`;
}

export function verifyOAuthState(token: string): Record<string, unknown> {
  const [bodyPart, sigPart] = token.split(".");
  if (!bodyPart || !sigPart) {
    throw new Error("Invalid state");
  }
  const body = fromB64url(bodyPart);
  const sig = fromB64url(sigPart);
  const expected = createHmac("sha256", getSecret()).update(body).digest();
  if (sig.length !== expected.length || !timingSafeEqual(sig, expected)) {
    throw new Error("Invalid state signature");
  }
  const parsed = JSON.parse(body.toString("utf8")) as Record<string, unknown>;
  const exp = Number(parsed.exp);
  if (!Number.isFinite(exp) || Date.now() > exp) {
    throw new Error("State expired");
  }
  return parsed;
}
