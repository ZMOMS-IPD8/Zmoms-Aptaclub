import { NextRequest, NextResponse } from "next/server";
import { checkMemberByPhone } from "../../lib/pancake/member";

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const leadId = String(body?.leadId ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const booking = body?.booking;

    if (!leadId) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_LEAD_ID",
          message: "Không xác định được thông tin hội viên.",
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

    if (!booking || typeof booking !== "object") {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_BOOKING",
          message: "Thông tin đăng ký không hợp lệ.",
        },
        { status: 400 },
      );
    }

    const address = String(booking?.address ?? "").trim();
    const date = String(booking?.date ?? "").trim();
    const time = String(booking?.time ?? "").trim();

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_ADDRESS",
          message: "Mẹ vui lòng nhập địa chỉ tắm bé.",
        },
        { status: 400 },
      );
    }

    if (!date || !time) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_DATETIME",
          message: "Mẹ vui lòng chọn ngày và giờ chăm sóc.",
        },
        { status: 400 },
      );
    }

    const member = await checkMemberByPhone(cleanPhone);

    if (!member.registered || !member.lead) {
      return NextResponse.json(
        {
          success: false,
          status: "MEMBER_NOT_FOUND",
          message: "Không tìm thấy thông tin hội viên.",
        },
        { status: 404 },
      );
    }

    if (String(member.leadId) !== leadId) {
      return NextResponse.json(
        {
          success: false,
          status: "LEAD_MISMATCH",
          message: "Thông tin hội viên không khớp.",
        },
        { status: 403 },
      );
    }

    const existingAddress = getFieldValue(member.lead.dia_chi_tam_be);
    const existingTime = getFieldValue(member.lead.thoi_gian_tam_be);

    const hasBathBooking = Boolean(existingAddress && existingTime);

    if (hasBathBooking) {
      return NextResponse.json(
        {
          success: false,
          status: "BATH_ALREADY_BOOKED",
          message:
            "Mẹ đã đăng ký buổi tư vấn và chăm sóc tại nhà trước đó. Mẹ không cần đăng ký lại.",
        },
        { status: 409 },
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

    const thoiGianTamBe = `${date} ${time}:00`;

    const updatePayload = {
      id: leadId,
      dia_chi_tam_be: address,
      thoi_gian_tam_be: thoiGianTamBe,
    };

    const updateUrl =
      `https://crm.pancake.vn/api/workspaces/` +
      `${workspaceId}/lead/records` +
      `?api_key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(updateUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatePayload),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          status: "UPDATE_FAILED",
          message:
            result?.message ||
            "Pancake không thể lưu thông tin đăng ký chăm sóc.",
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      status: "BATH_BOOKED",
      message: "Đăng ký buổi tư vấn và chăm sóc tại nhà thành công.",
      leadId,
      booking: {
        address,
        date,
        time,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        status: "SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi đăng ký chăm sóc.",
      },
      { status: 500 },
    );
  }
}
