import type { ReferralCode } from "../types/offer";

export const REFERRAL_CODES: ReferralCode[] = [];

export function validateReferralCode(value: string) {
  const normalized = value.trim().toUpperCase();

  if (!normalized) {
    return false;
  }

  const match = normalized.match(/^(PG|NHS|SPA|SALE)(\d{3})$/);

  if (!match) {
    return false;
  }

  const number = Number(match[2]);

  return number >= 1 && number <= 999;
}
