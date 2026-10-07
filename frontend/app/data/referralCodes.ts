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
  "C-10",
  "C-11",
  "C-12",
  "C-13",
  "C-14",
  "Z-00",
  "Z-03",
  "Z-04",
  "Z-05",
  "Z-06",
  "Z-GREEN",
  "Z-HMN",
  "Z-MEDUA",
  "Z-SAMMY",
  "Z-YHP",
  "Z-TPHP",
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
