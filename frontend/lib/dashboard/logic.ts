type PancakeLead = Record<string, unknown>;

export function getFieldValue(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }

  if (value && typeof value === "object" && "value" in value) {
    return String((value as { value?: unknown }).value ?? "").trim();
  }

  return "";
}

export function getNumericValue(value: unknown): number {
  const normalized = getFieldValue(value);

  if (!normalized) {
    return 0;
  }

  const cleaned = normalized.replace(/[^\d.,-]/g, "");

  if (!cleaned) {
    return 0;
  }

  const number =
    cleaned.includes(".") && cleaned.includes(",")
      ? Number(cleaned.replace(/\./g, "").replace(",", "."))
      : Number(cleaned.replace(/[.,]/g, ""));

  return Number.isFinite(number) ? number : 0;
}

export function normalizeStatus(value: unknown): string {
  return getFieldValue(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isTrue(value: unknown): boolean {
  const normalized = getFieldValue(value).toLowerCase();

  return normalized === "true" || normalized === "1" || normalized === "yes";
}

export function hasField(lead: PancakeLead, field: string): boolean {
  return getFieldValue(lead[field]) !== "";
}

export function isPaidStatus(value: unknown): boolean {
  const status = normalizeStatus(value);

  return (
    status.includes("da thanh toan") ||
    status.includes("paid") ||
    status.includes("success") ||
    status.includes("thanh toan thanh cong")
  );
}

export function hasSuccessfulDelivery(lead: PancakeLead): boolean {
  return getFieldValue(lead.ngay_giao_thanh_cong) !== "";
}

export function isCoData(lead: PancakeLead): boolean {
  return hasField(lead, "thoi_gian_dang_ky");
}

export function isCoEdu(lead: PancakeLead): boolean {
  return isCoData(lead) && hasField(lead, "thoi_gian_dang_ky_lop");
}

export function isCoLead(lead: PancakeLead): boolean {
  return isCoData(lead) && hasField(lead, "thoi_gian_dang_ky_tam_be");
}

export function isOrder(lead: PancakeLead): boolean {
  return hasField(lead, "ngay_dat_hang") && hasField(lead, "ma_don_hang");
}

export function isNU(lead: PancakeLead): boolean {
  return isCoData(lead) && isOrder(lead) && hasSuccessfulDelivery(lead);
}

export function isCoSell(lead: PancakeLead): boolean {
  return isNU(lead);
}

export function isDanoneConsent(lead: PancakeLead): boolean {
  return isTrue(lead.chia_se_de_dang_ky_aptaclub);
}

export function parseDate(value: unknown): Date | null {
  const normalized = getFieldValue(value);

  if (!normalized) {
    return null;
  }

  const isoDate = new Date(normalized);

  if (!Number.isNaN(isoDate.getTime())) {
    return isoDate;
  }

  const match = normalized.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const date = new Date(year, month - 1, day);

  return Number.isNaN(date.getTime()) ? null : date;
}
