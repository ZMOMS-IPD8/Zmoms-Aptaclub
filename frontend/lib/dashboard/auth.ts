const COOKIE_NAME = "dashboard_session";
const SESSION_DURATION = 60 * 60 * 24;

export type DashboardDataScope = "ALL" | "ZMOMS" | "CỘNG ĐỒNG BẦU";

export type DashboardRole = "CUSTOMER" | "TEAM";

export type DashboardSession = {
  sessionId: string;
  username: string;
  role: DashboardRole;
  dataScope: DashboardDataScope;
  exp: number;
};

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

function createSessionId(): string {
  return crypto.randomUUID();
}

export async function createSession(
  username: string,
  role: DashboardRole,
  dataScope: DashboardDataScope,
): Promise<string> {
  const payloadData: DashboardSession = {
    sessionId: createSessionId(),
    username,
    role,
    dataScope,
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION,
  };

  const payload = base64UrlEncode(
    toArrayBuffer(new TextEncoder().encode(JSON.stringify(payloadData))),
  );

  const signature = await sign(payload);

  return `${payload}.${signature}`;
}

export async function getSession(
  token: string | undefined,
): Promise<DashboardSession | null> {
  if (!token) {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 2) {
    return null;
  }

  const [payload, signature] = parts;

  if (!payload || !signature) {
    return null;
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
      return null;
    }

    const data = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(payload)),
    ) as Partial<DashboardSession>;

    if (
      !data ||
      typeof data.sessionId !== "string" ||
      !data.sessionId ||
      typeof data.username !== "string" ||
      !data.username ||
      (data.role !== "CUSTOMER" && data.role !== "TEAM") ||
      (data.dataScope !== "ALL" &&
        data.dataScope !== "ZMOMS" &&
        data.dataScope !== "CỘNG ĐỒNG BẦU") ||
      typeof data.exp !== "number"
    ) {
      return null;
    }

    if (data.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      sessionId: data.sessionId,
      username: data.username,
      role: data.role,
      dataScope: data.dataScope,
      exp: data.exp,
    };
  } catch {
    return null;
  }
}

export async function verifySession(
  token: string | undefined,
): Promise<boolean> {
  const session = await getSession(token);

  return session !== null;
}

export function getDashboardCookieName(): string {
  return COOKIE_NAME;
}

export function getDashboardSessionDuration(): number {
  return SESSION_DURATION;
}
