import { NextRequest, NextResponse } from "next/server";

type PancakeLead = {
  id?: string;
  lead_id?: string;
  record_id?: string;

  name?: string | null;
  phone_number?: string | null;

  ho_va_ten_lien_he?: string | null | { value?: string | null };
  thanh_pho?: string | null | { value?: string | null };
  ngay_du_sinh_hoac_ngay_sinh_cua_be?:
    | string
    | null
    | { value?: string | null };

  link_lop_hoc?: string | null | { value?: string | null };
  thoi_gian_tham_du?: string | null | { value?: string | null };
  dong_y_tham_du_lop_hoc?: string | null | { value?: string | null };

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

  [key: string]: unknown;
};

function getFieldValue(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value && typeof value === "object" && "value" in value) {
    return String((value as { value?: unknown }).value ?? "").trim();
  }

  return "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const phone = String(body?.phone ?? "").trim();

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          registered: false,
          status: "INVALID_PHONE",
          message: "Mẹ vui lòng nhập số điện thoại.",
        },
        { status: 400 },
      );
    }

    const cleanPhone = phone.replace(/\D/g, "");

    if (!/^0\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        {
          success: false,
          registered: false,
          status: "INVALID_PHONE",
          message:
            "Số điện thoại không đúng định dạng. Mẹ vui lòng kiểm tra lại.",
        },
        { status: 400 },
      );
    }

    const workspaceId = process.env.PANCAKE_WORKSPACE_ID;
    const apiKey = process.env.PANCAKE_API_KEY;
    const zaloUrl = process.env.ZMOMS_ZALO_OA_URL;

    if (!workspaceId || !apiKey) {
      console.error("Missing Pancake environment variables.");

      return NextResponse.json(
        {
          success: false,
          registered: false,
          status: "CONFIG_ERROR",
          message: "Chưa cấu hình Pancake API.",
        },
        { status: 500 },
      );
    }

    const filter = {
      is_group: false,
      fields: [
        {
          field_name: "phone_number",
          type: "$enter_value",
          value: cleanPhone,
          is_filter_exclude: false,
        },
      ],
    };

    const checkUrl =
      `https://crm.pancake.vn/api/workspaces/` +
      `${workspaceId}/lead/records` +
      `?api_key=${encodeURIComponent(apiKey)}` +
      `&filter=${encodeURIComponent(JSON.stringify(filter))}`;

    const checkResponse = await fetch(checkUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const checkResult = (await checkResponse.json()) as PancakeResponse;

    if (!checkResponse.ok) {
      console.error("Pancake member search error:", checkResponse.status);

      return NextResponse.json(
        {
          success: false,
          registered: false,
          status: "SEARCH_FAILED",
          message:
            "Không thể kiểm tra thông tin hội viên trên Pancake. Vui lòng thử lại.",
        },
        {
          status: checkResponse.status,
        },
      );
    }

    const existingLeads = Array.isArray(checkResult?.data?.entries)
      ? checkResult.data.entries
      : [];

    if (existingLeads.length === 0) {
      return NextResponse.json({
        success: true,
        registered: false,
        status: "MEMBER_NOT_FOUND",
        message: "Không tìm thấy thông tin hội viên với số điện thoại này.",
      });
    }

    const lead = existingLeads[0];

    const leadId = lead?.id || lead?.lead_id || lead?.record_id;

    if (!leadId) {
      console.error("Lead found but missing ID.");

      return NextResponse.json(
        {
          success: false,
          registered: false,
          status: "MISSING_LEAD_ID",
          message: "Không xác định được thông tin hội viên trên Pancake.",
        },
        { status: 500 },
      );
    }

    const fullName =
      getFieldValue(lead?.ho_va_ten_lien_he) || getFieldValue(lead?.name);

    const memberPhone = getFieldValue(lead?.phone_number) || cleanPhone;

    const province = getFieldValue(lead?.thanh_pho);

    const dueDate = getFieldValue(lead?.ngay_du_sinh_hoac_ngay_sinh_cua_be);

    const linkLopHoc = getFieldValue(lead?.link_lop_hoc);

    const thoiGianThamDu = getFieldValue(lead?.thoi_gian_tham_du);

    const dongYThamDu = getFieldValue(lead?.dong_y_tham_du_lop_hoc);

    const hasBooking =
      dongYThamDu === "Có" && Boolean(linkLopHoc) && Boolean(thoiGianThamDu);

    return NextResponse.json({
      success: true,
      registered: true,
      status: "MEMBER_FOUND",

      member: {
        leadId: String(leadId),
        name: fullName,
        phone: memberPhone,
        province,
        dueDate,

        booking: hasBooking
          ? {
              linkLopHoc,
              thoiGianThamDu,
            }
          : null,

        zaloUrl: zaloUrl || "",
      },
    });
  } catch (error) {
    console.error("Check member API error:", error);

    return NextResponse.json(
      {
        success: false,
        registered: false,
        status: "SERVER_ERROR",
        message:
          "Có lỗi xảy ra khi kiểm tra thông tin hội viên. Vui lòng thử lại.",
      },
      { status: 500 },
    );
  }
}
