type PancakeLead = Record<string, unknown>;

export function getFieldValue(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => getFieldValue(item))
      .filter(Boolean)
      .join(", ")
      .trim();
  }

  if (value && typeof value === "object" && "value" in value) {
    return getFieldValue((value as { value?: unknown }).value);
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
  const normalized = getFieldValue(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  return (
    normalized === "true" ||
    normalized === "1" ||
    normalized === "yes" ||
    normalized === "co"
  );
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
  return normalizeStatus(lead.trang_thai_giao_hang) === "giao thanh cong";
}

export function isCoData(lead: PancakeLead): boolean {
  return hasField(lead, "thoi_gian_dang_ky") && hasField(lead, "nguon_dang_ky");
}

export function isCoEdu(lead: PancakeLead): boolean {
  return isCoData(lead) && hasField(lead, "thoi_gian_dang_ky_lop");
}

export function isCoLead(lead: PancakeLead): boolean {
  return isCoData(lead) && hasField(lead, "thoi_gian_dang_ky_tam_be");
}

export function isBabyCareCompleted(lead: PancakeLead): boolean {
  return (
    hasField(lead, "ten_nhan_vien_tam_be") && hasField(lead, "ghi_chu_tam_be")
  );
}

export function isOrder(lead: PancakeLead): boolean {
  return hasField(lead, "ngay_dat_hang") && hasField(lead, "ma_don_hang");
}

export function isNU(lead: PancakeLead): boolean {
  return isCoData(lead) && isOrder(lead) && hasSuccessfulDelivery(lead);
}

export function hasPurchaseSource(lead: PancakeLead): boolean {
  return hasField(lead, "nguon_mua_hang");
}

export function isCoSell(lead: PancakeLead): boolean {
  return isNU(lead) && hasPurchaseSource(lead);
}

export function isDanoneConsent(lead: PancakeLead): boolean {
  return isTrue(lead.chia_se_de_dang_ky_aptaclub);
}

export function parseDate(value: unknown): Date | null {
  const normalized = getFieldValue(value);

  if (!normalized) {
    return null;
  }

  const vietnamDateTimeMatch = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?)?$/,
  );

  if (vietnamDateTimeMatch) {
    const [
      ,
      year,
      month,
      day,
      hour = "00",
      minute = "00",
      second = "00",
      millisecond = "0",
    ] = vietnamDateTimeMatch;

    const date = new Date(
      `${year}-${month}-${day}T${hour}:${minute}:${second}.${millisecond.padEnd(
        3,
        "0",
      )}+07:00`,
    );

    return Number.isNaN(date.getTime()) ? null : date;
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

  const date = new Date(
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
      2,
      "0",
    )}T00:00:00+07:00`,
  );

  return Number.isNaN(date.getTime()) ? null : date;
}
