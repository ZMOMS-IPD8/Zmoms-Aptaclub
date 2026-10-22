export const REGISTRATION_REFERRAL_MAPPING: Record<string, string[]> = {
  "C-00": ["SD"],
  "C-13": ["SD", "L-BW"],
  "C-14": ["SD"],
  "NHS-UNKNOWN": ["SD"],
  "Z-00": ["SD"],
  "Z-08": ["SD"],
  "Z-GREEN": ["B-GR"],
  "Z-HMN": ["SD"],
  "Z-MEDUA": ["SD"],
  "Z-SAMMY": ["S-SM"],
  "Z-YHP": ["B-YHP"],
  "Z-TPHP": ["B-TPHP"],
  "Z-HBB": ["S-HBB"],
  "Z-HN": ["L-BVHN"],
};

export const PURCHASE_REFERRAL_CODES: string[] = ["ABC123456"];

function normalizeReferralCode(code: string): string {
  return String(code ?? "")
    .trim()
    .toUpperCase();
}

export function isValidRegistrationReferralCode(code: string): boolean {
  const normalizedCode = normalizeReferralCode(code);

  if (!normalizedCode) {
    return true;
  }

  return Object.prototype.hasOwnProperty.call(
    REGISTRATION_REFERRAL_MAPPING,
    normalizedCode,
  );
}

export function isValidPurchaseReferralCode(code: string): boolean {
  const normalizedCode = normalizeReferralCode(code);

  if (!normalizedCode) {
    return true;
  }

  return PURCHASE_REFERRAL_CODES.includes(normalizedCode);
}

export function getRegistrationReferralMapping(code: string): string[] {
  const normalizedCode = normalizeReferralCode(code);

  return REGISTRATION_REFERRAL_MAPPING[normalizedCode] ?? [];
}
