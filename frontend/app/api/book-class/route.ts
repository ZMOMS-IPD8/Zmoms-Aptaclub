import { NextRequest, NextResponse } from "next/server";

type PancakeLead = {
  id?: string;
  lead_id?: string;
  record_id?: string;
  [key: string]: unknown;
};

type PancakeResponse = {
  success?: boolean;
  data?: {
    entries?: PancakeLead[];
    [key: string]: unknown;
  };
  message?: string;
  [key: string]: unknown;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const phone = String(body?.phone ?? "").trim();
    const linkLopHoc = String(body?.linkLopHoc ?? "").trim();
    const thoiGianThamDu = String(body?.thoiGianThamDu ?? "").trim();

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_PHONE",
          message: "Mẹ vui lòng nhập số điện thoại.",
        },
        { status: 400 },
      );
    }

    if (!linkLopHoc) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_CLASS_LINK",
          message: "Chưa có link lớp học.",
        },
        { status: 400 },
      );
    }

    if (!thoiGianThamDu) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_CLASS_TIME",
          message: "Chưa có thời gian tham dự.",
        },
        { status: 400 },
      );
    }

    const cleanPhone = phone.replace(/\D/g, "");

    if (!/^0\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_PHONE",
          message: "Số điện thoại không đúng định dạng.",
        },
        { status: 400 },
      );
    }

    const workspaceId = process.env.PANCAKE_WORKSPACE_ID;
    const apiKey = process.env.PANCAKE_API_KEY;

    if (!workspaceId || !apiKey) {
      return NextResponse.json(
        {
          success: false,
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

    const findUrl =
      `https://crm.pancake.vn/api/workspaces/` +
      `${workspaceId}/lead/records` +
      `?api_key=${encodeURIComponent(apiKey)}` +
      `&filter=${encodeURIComponent(JSON.stringify(filter))}`;

    const findResponse = await fetch(findUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const findResult = (await findResponse.json()) as PancakeResponse;

    if (!findResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          status: "SEARCH_FAILED",
          message: "Không thể tìm thông tin hội viên trên Pancake.",
        },
        { status: findResponse.status },
      );
    }

    const leads = Array.isArray(findResult?.data?.entries)
      ? findResult.data.entries
      : [];

    if (leads.length === 0) {
      return NextResponse.json(
        {
          success: false,
          status: "MEMBER_NOT_FOUND",
          message: "Không tìm thấy thông tin hội viên với số điện thoại này.",
        },
        { status: 404 },
      );
    }

    const lead = leads[0];

    const leadId = lead?.id || lead?.lead_id || lead?.record_id;

    if (!leadId) {
      return NextResponse.json(
        {
          success: false,
          status: "MISSING_LEAD_ID",
          message: "Không xác định được Lead trên Pancake.",
        },
        { status: 500 },
      );
    }

    const updatePayload = {
      id: String(leadId),
      link_lop_hoc: linkLopHoc,
      thoi_gian_tham_du: thoiGianThamDu,
      dong_y_tham_du_lop_hoc: "Có",
    };

    const updateUrl =
      `https://crm.pancake.vn/api/workspaces/` +
      `${workspaceId}/lead/records` +
      `?api_key=${encodeURIComponent(apiKey)}`;

    const updateResponse = await fetch(updateUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatePayload),
    });

    const updateResult = (await updateResponse.json()) as PancakeResponse;

    if (!updateResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          status: "UPDATE_FAILED",
          message:
            updateResult?.message ||
            "Pancake không thể cập nhật thông tin lớp học.",
          pancakeStatus: updateResponse.status,
          pancake: updateResult,
        },
        { status: updateResponse.status },
      );
    }

    return NextResponse.json({
      success: true,
      status: "CLASS_BOOKED",
      message: "Đăng ký lớp học thành công.",
      booking: {
        phone: cleanPhone,
        linkLopHoc,
        thoiGianThamDu,
        dongYThamDuLopHoc: "Có",
      },
      leadId: String(leadId),
      pancake: updateResult,
    });
  } catch (error) {
    console.error("Book class API error:", error);

    return NextResponse.json(
      {
        success: false,
        status: "SERVER_ERROR",
        message: "Có lỗi xảy ra khi đăng ký lớp học. Mẹ vui lòng thử lại.",
      },
      { status: 500 },
    );
  }
}
