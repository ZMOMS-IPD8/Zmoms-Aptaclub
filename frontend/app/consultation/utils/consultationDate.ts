import type { ClassSession } from "../data/classSessions";

export function normalizeBookingDateTime(value: string): string | null {
  const normalized = value.trim();

  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/,
  );

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] ?? "0");

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59
  ) {
    return null;
  }

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  if (day > daysInMonth) {
    return null;
  }

  return (
    `${String(year).padStart(4, "0")}-` +
    `${String(month).padStart(2, "0")}-` +
    `${String(day).padStart(2, "0")} ` +
    `${String(hour).padStart(2, "0")}:` +
    `${String(minute).padStart(2, "0")}:` +
    `${String(second).padStart(2, "0")}`
  );
}

export function hasClassStarted(value: string): boolean {
  const normalized = normalizeBookingDateTime(value);

  if (!normalized) {
    return false;
  }

  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})$/,
  );

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);

  const classTimeUtc = Date.UTC(year, month - 1, day, hour - 7, minute, second);

  return Date.now() >= classTimeUtc;
}

export function formatBookingDateTime(value: string): string {
  const normalized = normalizeBookingDateTime(value);

  if (!normalized) {
    return value;
  }

  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})$/,
  );

  if (!match) {
    return value;
  }

  return `${match[3]}/${match[2]}/${match[1]} · ${match[4]}:${match[5]}`;
}

export function getSessionTimestamp(session: ClassSession): number {
  const [year, month, day] = session.date.split("-").map(Number);
  const [hour, minute] = session.time.split(":").map(Number);

  return Date.UTC(year, month - 1, day, hour - 7, minute, 0);
}
