import { NextResponse } from "next/server";

type PancakeLead = {
  id?: string;
  name?: string | null;
  phone_number?: string | null;
  so_dien_thoai_dang_ky?: string | null;
  [key: string]: unknown;
};

type PancakeResponse = {
  success?: boolean;
  data?: {
    entries?: PancakeLead[];
    total_entries?: number;
    [key: string]: unknown;
  };
  message?: string;
  error?: string;
};

type FunnelStats = {
  total: number;
  lead: number;
  coData: number;
  coEdu: number;
  coLead: number;
  coSell: number;
};

function getFieldValue(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value).trim();
  }

  if (value && typeof value === "object" && "value" in value) {
    return String((value as { value?: unknown }).value ?? "").trim();
  }

  return "";
}

function getNumericValue(value: unknown): number {
  const normalized = getFieldValue(value);

  if (!normalized) {
    return 0;
  }

  const number = Number(normalized.replace(/[^\d.-]/g, ""));

  return Number.isFinite(number) ? number : 0;
}

function normalizeStatus(value: unknown): string {
  return getFieldValue(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isPaidStatus(value: unknown): boolean {
  const status = normalizeStatus(value);

  return (
    status.includes("da thanh toan") ||
    status.includes("paid") ||
    status.includes("success") ||
    status.includes("thanh toan thanh cong")
  );
}

function hasField(lead: PancakeLead, field: string): boolean {
  return getFieldValue(lead[field]) !== "";
}

function isCoData(lead: PancakeLead): boolean {
  return hasField(lead, "thoi_gian_dang_ky");
}

function isCoEdu(lead: PancakeLead): boolean {
  return hasField(lead, "thoi_gian_dang_ky_lop");
}

function isCoLead(lead: PancakeLead): boolean {
  return hasField(lead, "thoi_gian_dang_ky_tam_be");
}

function isCoSell(lead: PancakeLead): boolean {
  const hasOrderDate = hasField(lead, "ngay_dat_hang");

  const hasOrderCode = hasField(lead, "ma_don_hang");

  const paid = isPaidStatus(lead.trang_thai_thanh_toan);

  return hasOrderDate && hasOrderCode && paid;
}

function getFunnelStats(leads: PancakeLead[]): FunnelStats {
  const coDataLeads = leads.filter(isCoData);

  return {
    total: leads.length,

    lead: leads.filter((lead) => !isCoData(lead)).length,

    coData: coDataLeads.length,

    coEdu: coDataLeads.filter(isCoEdu).length,

    coLead: coDataLeads.filter(isCoLead).length,

    coSell: coDataLeads.filter(isCoSell).length,
  };
}

async function getLeads(): Promise<{
  entries: PancakeLead[];
  total: number;
}> {
  const workspaceId = process.env.PANCAKE_WORKSPACE_ID;

  const apiKey = process.env.PANCAKE_CRM_API_KEY;

  if (!workspaceId || !apiKey) {
    throw new Error("Chưa cấu hình Pancake CRM API.");
  }

  const url =
    `https://crm.pancake.vn/api/workspaces/` +
    `${workspaceId}/lead/records` +
    `?api_key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const text = await response.text();

  let result: PancakeResponse = {};

  if (text.trim()) {
    try {
      result = JSON.parse(text) as PancakeResponse;
    } catch {
      throw new Error("Pancake CRM trả về dữ liệu không hợp lệ.");
    }
  }

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        `Pancake CRM trả lỗi HTTP ${response.status}.`,
    );
  }

  const entries = Array.isArray(result.data?.entries)
    ? result.data.entries
    : [];

  return {
    entries,
    total: result.data?.total_entries ?? entries.length,
  };
}

function countByField(
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

function countByDate(
  leads: PancakeLead[],
  field: string,
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const lead of leads) {
    const value = getFieldValue(lead[field]);

    if (!value) {
      continue;
    }

    const match = value.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);

    if (!match) {
      continue;
    }

    const day = match[1].padStart(2, "0");

    const month = match[2].padStart(2, "0");

    const year = match[3];

    const date = `${year}-${month}-${day}`;

    result[date] = (result[date] || 0) + 1;
  }

  return result;
}

function countNonEmptyField(leads: PancakeLead[], field: string): number {
  return leads.filter((lead) => hasField(lead, field)).length;
}

function isOrder(lead: PancakeLead): boolean {
  const hasOrderDate = hasField(lead, "ngay_dat_hang");

  const hasOrderCode = hasField(lead, "ma_don_hang");

  return hasOrderDate && hasOrderCode;
}

export async function GET() {
  try {
    const { entries, total } = await getLeads();

    const funnel = getFunnelStats(entries);

    const coDataLeads = entries.filter(isCoData);

    const coEduLeads = coDataLeads.filter(isCoEdu);

    const coLeadLeads = coDataLeads.filter(isCoLead);

    const coSellLeads = coDataLeads.filter(isCoSell);

    const ebookReceived = countNonEmptyField(entries, "email_nhan_ebook");

    const consultationRegistered = countNonEmptyField(
      entries,
      "thoi_gian_dang_ky_lop",
    );

    const consultationAttended = countNonEmptyField(
      entries,
      "thoi_gian_tham_du",
    );

    const babyCareRegistered = countNonEmptyField(
      entries,
      "thoi_gian_dang_ky_tam_be",
    );

    const babyCareCompleted = countNonEmptyField(entries, "thoi_gian_tam_be");

    const orders = entries.filter(isOrder);

    const paidOrders = orders.filter((lead) =>
      isPaidStatus(lead.trang_thai_thanh_toan),
    );

    const revenue = paidOrders.reduce(
      (totalRevenue, lead) => totalRevenue + getNumericValue(lead.gia_tien),
      0,
    );

    const registrationsByDate = countByDate(coDataLeads, "thoi_gian_dang_ky");

    const registrationsByProvince = countByField(coDataLeads, "thanh_pho");

    const registrationsBySource = countByField(coDataLeads, "nguon_dang_ky");

    const mothersByStatus = countByField(coDataLeads, "tinh_trang_me");

    const ordersByCombo = countByField(orders, "ten_combo");

    const paymentStatus = countByField(orders, "trang_thai_thanh_toan");

    return NextResponse.json({
      success: true,

      data: {
        totalLeads: total,

        loadedLeads: entries.length,

        funnel: {
          total: funnel.total,

          lead: funnel.lead,

          coData: funnel.coData,

          coEdu: funnel.coEdu,

          coLead: funnel.coLead,

          coSell: funnel.coSell,
        },

        ebook: {
          received: ebookReceived,
        },

        consultation: {
          registered: consultationRegistered,

          attended: consultationAttended,
        },

        babyCare: {
          registered: babyCareRegistered,

          completed: babyCareCompleted,
        },

        orders: {
          total: orders.length,

          paid: paidOrders.length,

          unpaid: orders.length - paidOrders.length,

          revenue,
        },

        registrations: {
          byDate: registrationsByDate,

          byProvince: registrationsByProvince,

          bySource: registrationsBySource,
        },

        mothers: {
          byStatus: mothersByStatus,
        },

        ordersByCombo,

        paymentStatus,

        breakdown: {
          coData: {
            total: coDataLeads.length,
          },

          coEdu: {
            total: coEduLeads.length,
          },

          coLead: {
            total: coLeadLeads.length,
          },

          coSell: {
            total: coSellLeads.length,
          },
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể lấy thống kê Pancake CRM.",
      },
      { status: 500 },
    );
  }
}
