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

    const zaloUrl = process.env.ZMOMS_ZALO_OA_URL || "";

    const member = await checkMemberByPhone(cleanPhone);

    if (!member.registered || !member.lead) {
      return NextResponse.json({
        success: true,
        registered: false,
        status: "MEMBER_NOT_FOUND",
        message: "Không tìm thấy thông tin hội viên với số điện thoại này.",
        zaloUrl,
      });
    }

    const lead = member.lead;

    const memberPhone = getFieldValue(lead.phone_number) || member.phone;
    const province = getFieldValue(lead.thanh_pho);
    const dueDate = getFieldValue(lead.ngay_du_sinh_hoac_ngay_sinh_cua_be);

    const linkLopHoc = getFieldValue(lead.link_lop_hoc);
    const thoiGianThamDu = getFieldValue(lead.thoi_gian_tham_du);
    const dongYThamDu = getFieldValue(lead.dong_y_tham_du_lop_hoc);

    const preSurvey = getFieldValue(lead.truoc_khi_tham_gia_lop_hoc);

    const postRating = getFieldValue(lead.post_rating);

    const hasPreSurvey = Boolean(preSurvey);
    const hasPostSurvey = Boolean(postRating);

    const hasBooking =
      dongYThamDu === "Có" && Boolean(linkLopHoc) && Boolean(thoiGianThamDu);

    return NextResponse.json({
      success: true,
      registered: true,
      status: "MEMBER_FOUND",
      member: {
        leadId: member.leadId,
        name: member.fullName,
        phone: memberPhone,
        province,
        dueDate,
        hasPreSurvey,
        hasPostSurvey,
        booking: hasBooking
          ? {
              linkLopHoc,
              thoiGianThamDu,
            }
          : null,
        zaloUrl,
      },
      zaloUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        registered: false,
        status: "SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi kiểm tra thông tin hội viên. Vui lòng thử lại.",
      },
      { status: 500 },
    );
  }
}
