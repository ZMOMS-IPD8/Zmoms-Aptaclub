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

function normalizeBathDateTime(value: string): string {
  return value
    .trim()
    .replace("T", " ")
    .replace(/\s+/g, " ")
    .replace(/Z$/, "")
    .replace(/([+-]\d{2}:\d{2})$/, "")
    .replace(/\.\d+$/, "");
}

function isBathTimePassed(value: string): boolean {
  const normalized = normalizeBathDateTime(value);

  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] ?? "0");

  const bookingTimestamp = Date.UTC(year, month - 1, day, hour, minute, second);

  return Date.now() >= bookingTimestamp;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const leadId = String(body?.leadId ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const review = body?.review;

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
          message: "Không xác định được số điện thoại hội viên.",
        },
        { status: 400 },
      );
    }

    if (!review || typeof review !== "object") {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_REVIEW",
          message: "Dữ liệu không hợp lệ.",
        },
        { status: 400 },
      );
    }

    const staffName = String(review?.staffName ?? "").trim();
    const notes = String(review?.notes ?? "").trim();

    if (!staffName) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_STAFF_NAME",
          message: "Mẹ vui lòng nhập tên nhân viên chăm sóc.",
        },
        { status: 400 },
      );
    }

    if (!notes) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_BATH_NOTE",
          message: "Mẹ vui lòng nhập ghi chú sau buổi chăm sóc.",
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

    const address = getFieldValue(member.lead.dia_chi_tam_be);
    const bathTime = getFieldValue(member.lead.thoi_gian_tam_be);

    if (!address || !bathTime) {
      return NextResponse.json(
        {
          success: false,
          status: "BATH_BOOKING_NOT_FOUND",
          message: "Không tìm thấy thông tin buổi chăm sóc tại nhà.",
        },
        { status: 404 },
      );
    }

    if (!isBathTimePassed(bathTime)) {
      return NextResponse.json(
        {
          success: false,
          status: "BATH_TIME_NOT_PASSED",
          message:
            "Chưa đến thời gian chăm sóc. Mẹ vui lòng cập nhật sau khi hoàn tất buổi chăm sóc.",
        },
        { status: 403 },
      );
    }

    const existingStaffName = getFieldValue(member.lead.ten_nhan_vien_tam_be);

    const existingBathNote = getFieldValue(member.lead.ghi_chu_tam_be);

    if (existingStaffName && existingBathNote) {
      return NextResponse.json(
        {
          success: false,
          status: "BATH_REVIEW_ALREADY_COMPLETED",
          message: "Mẹ đã hoàn tất thông tin sau buổi chăm sóc trước đó.",
        },
        { status: 409 },
      );
    }

    const workspaceId = process.env.PANCAKE_WORKSPACE_ID;
    const apiKey = process.env.PANCAKE_CRM_API_KEY;

    if (!workspaceId || !apiKey) {
      return NextResponse.json(
        {
          success: false,
          status: "CONFIG_ERROR",
          message: "Chưa cấu hình Pancake CRM API.",
        },
        { status: 500 },
      );
    }

    const updatePayload = {
      id: leadId,
      ten_nhan_vien_tam_be: staffName,
      ghi_chu_tam_be: notes,
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
            "Pancake không thể lưu thông tin sau buổi chăm sóc.",
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      status: "BATH_REVIEW_SAVED",
      message: "Đã lưu thông tin sau buổi chăm sóc.",
      leadId,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        status: "SERVER_ERROR",
        message: "Có lỗi xảy ra khi lưu thông tin.",
      },
      { status: 500 },
    );
  }
}
