export const REGISTRATION_REFERRAL_CODES: string[] = [
  "C-00",
  "C-01",
  "C-02",
  "C-03",
  "C-04",
  "C-05",
  "C-06",
  "C-07",
  "C-08",
  "C-09",
  "C-BVHP",
  "C-BVHP01",
  "C-BVHP02",
  "C-BVHP03",
  "C-KEI",
  "C-SHING",
  "C-SL",
  "NHS-UNKNOWN",
  "Z-00",
  "Z-CIH",
  "Z-GREEN",
  "Z-GREEN01",
  "Z-HMN",
  "Z-KID",
  "Z-MEDUA",
  "Z-PSAC",
  "Z-SAMMY",
  "Z-SHING",
  "Z-SL",
  "Z-YHP",
  "Z-KID1",
  "Z-KID2",
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
