export function formatNumber(value: number): string {
  return value.toLocaleString("vi-VN");
}

export function formatCurrency(value: number): string {
  return `${value.toLocaleString("vi-VN")}đ`;
}

export function formatPercent(value: number): string {
  return `${Number(value.toFixed(2))}%`;
}

export function formatDate(value: string): string {
  if (!value) {
    return "—";
  }

  const isoDate = new Date(value);

  if (!Number.isNaN(isoDate.getTime())) {
    return new Intl.DateTimeFormat("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .format(isoDate)
      .replace(",", "");
  }

  const match = value.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);

  if (match) {
    return `${match[1].padStart(2, "0")}/${match[2].padStart(
      2,
      "0",
    )}/${match[3]}`;
  }

  return value;
}

export function formatPhone(value: string): string {
  if (!value) {
    return "—";
  }

  return value;
}

export function formatEmpty(value: string): string {
  return value?.trim() || "—";
}
