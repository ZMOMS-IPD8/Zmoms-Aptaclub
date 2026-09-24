import { NextResponse } from "next/server";

type PancakeLead = {
  id?: string;
  name?: string | null;
  phone_number?: string | null;
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

async function getLeads(): Promise<PancakeLead[]> {
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

  return Array.isArray(result.data?.entries) ? result.data.entries : [];
}

function isCoData(lead: PancakeLead): boolean {
  return getFieldValue(lead.thoi_gian_dang_ky) !== "";
}

function isCoLead(lead: PancakeLead): boolean {
  return isCoData(lead) && getFieldValue(lead.thoi_gian_dang_ky_tam_be) !== "";
}

function formatBabyCare(lead: PancakeLead) {
  return {
    id: getFieldValue(lead.id),

    name: getFieldValue(lead.ho_va_ten_lien_he) || getFieldValue(lead.name),

    phone:
      getFieldValue(lead.so_dien_thoai_dang_ky) ||
      getFieldValue(lead.phone_number),

    address: getFieldValue(lead.dia_chi_tam_be),

    registeredAt: getFieldValue(lead.thoi_gian_dang_ky_tam_be),

    serviceTime: getFieldValue(lead.thoi_gian_tam_be),

    note: getFieldValue(lead.ghi_chu_tam_be),

    staff: getFieldValue(lead.ten_nhan_vien_tam_be),
  };
}

export async function GET() {
  try {
    const leads = await getLeads();

    const babyCareLeads = leads.filter(isCoLead).map(formatBabyCare);

    const registered = babyCareLeads.filter((item) => item.registeredAt !== "");

    const completed = babyCareLeads.filter((item) => item.serviceTime !== "");

    const completionRate =
      registered.length > 0
        ? Number(((completed.length / registered.length) * 100).toFixed(2))
        : 0;

    return NextResponse.json({
      success: true,

      data: {
        total: babyCareLeads.length,

        registered: registered.length,

        completed: completed.length,

        pending: registered.length - completed.length,

        completionRate,

        babyCare: babyCareLeads,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể lấy dữ liệu Baby Care.",
      },
      { status: 500 },
    );
  }
}
