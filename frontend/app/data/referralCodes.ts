export const REGISTRATION_REFERRAL_CODES: string[] = [
  "C-BVHP",
  "C-KEI",
  "C-SL",
  "C-00",
  "C-01",
  "C-02",
  "C-03",
  "C-04",
  "C-05",
  "C-06",
  "C-07",
  "C-SHING",
  "NHS-UNKNOWN",
  "ZM-CIH",
  "ZM-GREEN",
  "ZM-GREEN01",
  "ZM-HMN",
  "ZM-KIDS",
  "ZM-PSAC",
  "ZM-SL",
  "ZM-SAMMY",
  "ZM-00",
  "ZM-01",
  "ZM-02",
  "ZM-03",
  "ZM-04",
  "ZM-05",
  "ZM-06",
  "ZM-07",
  "ZM-SHING",
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
