import { NextResponse } from "next/server";

type PancakeLead = {
  id?: string;
  lead_id?: string;
  record_id?: string;
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
  [key: string]: unknown;
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

function isCoData(lead: PancakeLead): boolean {
  return getFieldValue(lead.thoi_gian_dang_ky) !== "";
}

function getPancakeErrorMessage(
  result: PancakeResponse,
  response: Response,
): string {
  if (typeof result.message === "string" && result.message.trim()) {
    return result.message.trim();
  }

  if (typeof result.error === "string" && result.error.trim()) {
    return result.error.trim();
  }

  return `Pancake CRM trả lỗi HTTP ${response.status}.`;
}

export async function GET() {
  try {
    const workspaceId = process.env.PANCAKE_WORKSPACE_ID;

    const apiKey = process.env.PANCAKE_CRM_API_KEY;

    if (!workspaceId || !apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Chưa cấu hình Pancake CRM API.",
        },
        { status: 500 },
      );
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
        return NextResponse.json(
          {
            success: false,
            message: "Pancake CRM trả về dữ liệu không hợp lệ.",
          },
          { status: 502 },
        );
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: getPancakeErrorMessage(result, response),
        },
        { status: response.status },
      );
    }

    const entries = Array.isArray(result.data?.entries)
      ? result.data.entries
      : [];

    const leads = entries.filter((lead) => !isCoData(lead));

    return NextResponse.json({
      success: true,

      data: {
        entries: leads,

        total_entries: leads.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể lấy dữ liệu Lead Pancake CRM.",
      },
      { status: 500 },
    );
  }
}
