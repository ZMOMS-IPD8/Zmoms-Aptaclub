const COOKIE_NAME = "dashboard_session";
const SESSION_DURATION = 60 * 60 * 24;

function getSecret(): string {
  const secret = process.env.DASHBOARD_SESSION_SECRET;

  if (!secret) {
    throw new Error("DASHBOARD_SESSION_SECRET chưa được cấu hình.");
  }

  return secret;
}

function toArrayBuffer(value: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(value.byteLength);

  new Uint8Array(buffer).set(value);

  return buffer;
}

function base64UrlEncode(value: ArrayBuffer): string {
  const bytes = new Uint8Array(value);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value: string): ArrayBuffer {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");

  const padding =
    normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));

  const binary = atob(normalized + padding);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }

  return toArrayBuffer(bytes);
}

async function getSigningKey(): Promise<CryptoKey> {
  const secret = toArrayBuffer(new TextEncoder().encode(getSecret()));

  return crypto.subtle.importKey(
    "raw",
    secret,
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign", "verify"],
  );
}

async function sign(value: string): Promise<string> {
  const key = await getSigningKey();

  const data = toArrayBuffer(new TextEncoder().encode(value));

  const signature = await crypto.subtle.sign("HMAC", key, data);

  return base64UrlEncode(signature);
}

export async function createSession(username: string): Promise<string> {
  const payloadData = JSON.stringify({
    username,
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION,
  });

  const payload = base64UrlEncode(
    toArrayBuffer(new TextEncoder().encode(payloadData)),
  );

  const signature = await sign(payload);

  return `${payload}.${signature}`;
}

export async function verifySession(
  token: string | undefined,
): Promise<boolean> {
  if (!token) {
    return false;
  }

  const parts = token.split(".");

  if (parts.length !== 2) {
    return false;
  }

  const [payload, signature] = parts;

  if (!payload || !signature) {
    return false;
  }

  try {
    const key = await getSigningKey();

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlDecode(signature),
      toArrayBuffer(new TextEncoder().encode(payload)),
    );

    if (!valid) {
      return false;
    }

    const data = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)));

    if (
      !data ||
      typeof data.username !== "string" ||
      !data.username ||
      typeof data.exp !== "number"
    ) {
      return false;
    }

    return data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function getDashboardCookieName(): string {
  return COOKIE_NAME;
}

export function getDashboardSessionDuration(): number {
  return SESSION_DURATION;
}
