export const REGISTRATION_REFERRAL_MAPPING: Record<string, string[]> = {
  "C-00": ["SD"],
  "C-01": ["SD"],
  "C-02": ["SD"],
  "C-03": ["SD"],
  "C-04": ["SD"],
  "C-05": ["SD"],
  "C-06": ["SD"],
  "C-07": ["SD"],
  "C-08": ["SD"],
  "C-09": ["SD"],
  "C-10": ["SD"],
  "C-11": ["SD", "L-PSAC"],
  "C-12": ["SD", "L-PSAC"],
  "C-13": ["SD", "L-PSAC"],
  "C-14": ["SD"],
  "NHS-UNKNOWN": ["SD"],
  "Z-00": ["SD"],
  "Z-03": ["SD"],
  "Z-04": ["SD"],
  "Z-05": ["SD"],
  "Z-06": ["SD"],
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
