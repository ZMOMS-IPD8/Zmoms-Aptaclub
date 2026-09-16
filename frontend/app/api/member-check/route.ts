import { NextRequest, NextResponse } from "next/server";
import { checkMemberByPhone } from "../../lib/pancake/member";
import {
  getFieldValue,
  normalizeClassDateTime,
} from "../../lib/pancake/classTime";

function shiftHours(value: string, hours: number): string {
  const normalized = normalizeClassDateTime(value);

  if (!normalized) {
    return value;
  }

  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/,
  );

  if (!match) {
    return value;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);

  const timestamp = Date.UTC(year, month - 1, day, hour, minute, second);

  const adjusted = new Date(timestamp + hours * 60 * 60 * 1000);

  const result =
    `${adjusted.getUTCFullYear().toString().padStart(4, "0")}-` +
    `${(adjusted.getUTCMonth() + 1).toString().padStart(2, "0")}-` +
    `${adjusted.getUTCDate().toString().padStart(2, "0")} ` +
    `${adjusted.getUTCHours().toString().padStart(2, "0")}:` +
    `${adjusted.getUTCMinutes().toString().padStart(2, "0")}:` +
    `${adjusted.getUTCSeconds().toString().padStart(2, "0")}`;

  return result;
}

function convertPancakeBookingTime(value: string): string {
  return shiftHours(value, 7);
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

    const pancakeThoiGianThamDu = getFieldValue(lead.thoi_gian_tham_du);

    const thoiGianThamDu = pancakeThoiGianThamDu
      ? convertPancakeBookingTime(pancakeThoiGianThamDu)
      : "";

    const preSurvey = getFieldValue(lead.truoc_khi_tham_gia_lop_hoc);

    const postRating = getFieldValue(lead.post_rating);
    const hasBooking = Boolean(linkLopHoc) && Boolean(thoiGianThamDu);

    const hasPreSurvey = Boolean(preSurvey);
    const hasPostSurvey = Boolean(postRating);

    let consultationStatus:
      | "NEED_CLASS"
      | "NEED_PRE_SURVEY"
      | "BOOKED"
      | "POST_SURVEY_COMPLETED";

    if (!hasBooking) {
      consultationStatus = "NEED_CLASS";
    } else if (!hasPreSurvey) {
      consultationStatus = "NEED_PRE_SURVEY";
    } else if (hasPostSurvey) {
      consultationStatus = "POST_SURVEY_COMPLETED";
    } else {
      consultationStatus = "BOOKED";
    }

    return NextResponse.json({
      success: true,
      registered: true,
      status: "MEMBER_FOUND",
      consultationStatus,

      debug: {
        pancakeThoiGianThamDu,
        thoiGianThamDu,
      },

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
