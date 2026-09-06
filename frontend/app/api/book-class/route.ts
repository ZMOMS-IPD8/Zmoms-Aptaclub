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

    const member = await checkMemberByPhone(cleanPhone);

    if (!member.registered || !member.leadId || !member.lead) {
      return NextResponse.json(
        {
          success: false,
          registered: false,
          status: "MEMBER_NOT_FOUND",
          message: "Số điện thoại này chưa đăng ký hội viên.",
        },
        { status: 403 },
      );
    }

    const existingLink = getFieldValue(member.lead.link_lop_hoc);
    const existingTime = getFieldValue(member.lead.thoi_gian_tham_du);
    const existingConsent = getFieldValue(member.lead.dong_y_tham_du_lop_hoc);

    const hasExistingBooking =
      existingConsent === "Có" &&
      Boolean(existingLink) &&
      Boolean(existingTime);

    if (hasExistingBooking) {
      return NextResponse.json(
        {
          success: false,
          status: "CLASS_ALREADY_BOOKED",
          message: "Mẹ đã đăng ký lớp học trước đó. Mẹ không cần đăng ký lại.",
          booking: {
            linkLopHoc: existingLink,
            thoiGianThamDu: existingTime,
          },
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

    const updatePayload = {
      id: member.leadId,
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

    const updateResult = await updateResponse.json();

    if (!updateResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          status: "UPDATE_FAILED",
          message:
            updateResult?.message ||
            "Pancake không thể cập nhật thông tin lớp học.",
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
      leadId: member.leadId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        status: "SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi đăng ký lớp học. Mẹ vui lòng thử lại.",
      },
      { status: 500 },
    );
  }
}
