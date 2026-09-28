import type { DashboardStats } from "../../app/dashboard/(app)/types/dashboard";

import {
  getFieldValue,
  isCoData,
  isDanoneConsent,
  isNU,
  parseDate,
} from "./logic";

type PancakeLead = Record<string, unknown>;

const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";

export function countByField(
  leads: PancakeLead[],
  field: string,
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const lead of leads) {
    const value = getFieldValue(lead[field]) || "Chưa có";

    result[value] = (result[value] || 0) + 1;
  }

  return result;
}

export function getVietnamDateKey(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: VIETNAM_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getVietnamDateKeyFromValue(value: unknown): string {
  const date = parseDate(value);

  if (!date) {
    return "";
  }

  return getVietnamDateKey(date);
}

export function countByDate(
  leads: PancakeLead[],
  field: string,
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const lead of leads) {
    const date = getVietnamDateKeyFromValue(lead[field]);

    if (!date) {
      continue;
    }

    result[date] = (result[date] || 0) + 1;
  }

  return result;
}

function getVietnamDateParts(value: unknown): {
  year: number;
  month: number;
  day: number;
} | null {
  const date = parseDate(value);

  if (!date) {
    return null;
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: VIETNAM_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  if (!year || !month || !day) {
    return null;
  }

  return {
    year,
    month,
    day,
  };
}

function getWeekKey(value: unknown): string {
  const parts = getVietnamDateParts(value);

  if (!parts) {
    return "";
  }

  const utcDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));

  const day = utcDate.getUTCDay() || 7;

  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);

  const year = utcDate.getUTCFullYear();

  const yearStart = new Date(Date.UTC(year, 0, 1));

  const week = Math.ceil(
    ((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );

  return `${year}-W${String(week).padStart(2, "0")}`;
}

function getMonthKey(value: unknown): string {
  const parts = getVietnamDateParts(value);

  if (!parts) {
    return "";
  }

  return `${parts.year}-${String(parts.month).padStart(2, "0")}`;
}

export function countByPeriod(
  leads: PancakeLead[],
  field: string,
  period: "week" | "month",
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const lead of leads) {
    const key =
      period === "week" ? getWeekKey(lead[field]) : getMonthKey(lead[field]);

    if (!key) {
      continue;
    }

    result[key] = (result[key] || 0) + 1;
  }

  return result;
}

export function calculateConversion(
  baseCount: number,
  convertedCount: number,
): number {
  if (baseCount <= 0) {
    return 0;
  }

  return Number(((convertedCount / baseCount) * 100).toFixed(2));
}

export function getGroupedConversion(leads: PancakeLead[], groupField: string) {
  const groups: Record<
    string,
    {
      lead: number;
      consent: number;
      nu: number;
    }
  > = {};

  for (const lead of leads) {
    const group = getFieldValue(lead[groupField]) || "Chưa có";

    if (!groups[group]) {
      groups[group] = {
        lead: 0,
        consent: 0,
        nu: 0,
      };
    }

    groups[group].lead += 1;

    if (isDanoneConsent(lead)) {
      groups[group].consent += 1;
    }

    if (isNU(lead)) {
      groups[group].nu += 1;
    }
  }

  return Object.fromEntries(
    Object.entries(groups).map(([group, value]) => [
      group,
      {
        lead: value.lead,
        consent: value.consent,
        consentRate: calculateConversion(value.lead, value.consent),
        nu: value.nu,
        conversionRate: calculateConversion(value.lead, value.nu),
      },
    ]),
  );
}

export function getFunnelStats(leads: PancakeLead[]): DashboardStats["funnel"] {
  const coDataLeads = leads.filter(isCoData);

  return {
    total: leads.length,
    lead: 0,
    coData: coDataLeads.length,
    coEdu: coDataLeads.filter(
      (lead) => getFieldValue(lead.thoi_gian_dang_ky_lop) !== "",
    ).length,
    coLead: coDataLeads.filter(
      (lead) => getFieldValue(lead.thoi_gian_dang_ky_tam_be) !== "",
    ).length,
    coSell: coDataLeads.filter(isNU).length,
  };
}

export function getPregnancySegmentation(
  leads: PancakeLead[],
): Record<string, number> {
  const result: Record<string, number> = {
    "Đang mang thai": 0,
    "Đã sinh": 0,
    "Không xác định": 0,
  };

  for (const lead of leads) {
    const status = getFieldValue(lead.tinh_trang_me)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    if (status.includes("mang thai")) {
      result["Đang mang thai"] += 1;
      continue;
    }

    if (status.includes("da sinh")) {
      result["Đã sinh"] += 1;
      continue;
    }

    const dateValue = getFieldValue(lead.ngay_du_sinh_hoac_ngay_sinh_cua_be);

    if (dateValue) {
      const date = parseDate(dateValue);

      if (date) {
        if (date.getTime() > Date.now()) {
          result["Đang mang thai"] += 1;
        } else {
          result["Đã sinh"] += 1;
        }

        continue;
      }
    }

    result["Không xác định"] += 1;
  }

  return result;
}
