import type { ReferralCode } from "../types/offer";

export const REFERRAL_CODES: ReferralCode[] = [
  {
    code: "NHS001",
    active: true,
  },
  {
    code: "NHS002",
    active: true,
  },
  {
    code: "NHS003",
    active: true,
  },
];

export function validateReferralCode(value: string) {
  const normalized = value.trim().toUpperCase();

  if (!normalized) {
    return false;
  }

  return REFERRAL_CODES.some(
    (item) => item.code === normalized && item.active
  );
}