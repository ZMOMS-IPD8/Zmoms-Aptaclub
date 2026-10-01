export const REGISTRATION_REFERRAL_CODES: string[] = [
  "C-BVHP",
  "C-KEI",
  "C-SALES",
  "C-SEEDING",
  "C-SEEDING01",
  "C-SEEDING02",
  "C-SEEDING03",
  "C-SEEDING04",
  "C-SEEDING05",
  "C-SEEDING06",
  "C-SEEDING07",
  "C-SHING",
  "NHS-UNKNOWN",
  "ZM-CIH",
  "ZM-GREEN",
  "ZM-GREEN-01",
  "ZM-HMN",
  "ZM-KIDS",
  "ZM-PSAC",
  "ZM-SALES",
  "ZM-SAMMY",
  "ZM-SEEDING",
  "ZM-SHING",
  "ZM-ZALOOA",
];

export const PURCHASE_REFERRAL_CODES: string[] = ["ABC123456"];

export function isValidRegistrationReferralCode(code: string): boolean {
  if (!code.trim()) {
    return true;
  }

  const normalizedCode = code.trim().toUpperCase();

  return REGISTRATION_REFERRAL_CODES.includes(normalizedCode);
}

export function isValidPurchaseReferralCode(code: string): boolean {
  if (!code.trim()) {
    return true;
  }

  const normalizedCode = code.trim().toUpperCase();

  return PURCHASE_REFERRAL_CODES.includes(normalizedCode);
}
