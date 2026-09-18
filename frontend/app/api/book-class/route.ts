import { NextRequest, NextResponse } from "next/server";
import { checkMemberByPhone } from "../../lib/pancake/member";
import {
  getFieldValue,
  normalizeClassDateTime,
} from "../../lib/pancake/classTime";
import {
  CLASS_SESSIONS,
  formatClassDateTime,
} from "../../consultation/data/classSessions";

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

  return (
    `${adjusted.getUTCFullYear().toString().padStart(4, "0")}-` +
    `${(adjusted.getUTCMonth() + 1).toString().padStart(2, "0")}-` +
    `${adjusted.getUTCDate().toString().padStart(2, "0")} ` +
    `${adjusted.getUTCHours().toString().padStart(2, "0")}:` +
    `${adjusted.getUTCMinutes().toString().padStart(2, "0")}:` +
    `${adjusted.getUTCSeconds().toString().padStart(2, "0")}`
  );
}

function convertVietnamTimeToPancake(value: string): string {
  return shiftHours(value, -7);
}

async function parsePancakeResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getPancakeMessage(result: unknown): string {
  if (!result || typeof result !== "object") {
    return "Pancake không thể cập nhật thông tin lớp học.";
  }

  const data = result as {
    message?: unknown;
    error?: unknown;
  };

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message.trim();
  }

  if (typeof data.error === "string" && data.error.trim()) {
    return data.error.trim();
  }

  return "Pancake không thể cập nhật thông tin lớp học.";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const phone = String(body?.phone ?? "").trim();
    const linkLopHoc = String(body?.linkLopHoc ?? "").trim();
    const rawThoiGianThamDu = String(body?.thoiGianThamDu ?? "").trim();

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

    if (!rawThoiGianThamDu) {
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

    const thoiGianThamDu = normalizeClassDateTime(rawThoiGianThamDu);

    if (!thoiGianThamDu) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_CLASS_TIME",
          message:
            "Thời gian tham dự không đúng định dạng. Vui lòng chọn lại buổi học.",
        },
        { status: 400 },
      );
    }

    const selectedClass = CLASS_SESSIONS.find(
      (session) =>
        session.meetUrl === linkLopHoc &&
        formatClassDateTime(session) === thoiGianThamDu,
    );

    if (!selectedClass) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_CLASS",
          message:
            "Buổi tư vấn không hợp lệ hoặc không còn tồn tại. Mẹ vui lòng chọn lại.",
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

    const hasExistingBooking = Boolean(existingLink) && Boolean(existingTime);

    if (hasExistingBooking) {
      const existingTimeVietnam = convertPancakeBookingTime(existingTime);

      return NextResponse.json(
        {
          success: false,
          status: "CLASS_ALREADY_BOOKED",
          message: "Mẹ đã đăng ký lớp học trước đó. Mẹ không cần đăng ký lại.",
          booking: {
            linkLopHoc: existingLink,
            thoiGianThamDu: existingTimeVietnam,
          },
        },
        { status: 409 },
      );
    }

    const existingPreSurvey = getFieldValue(
      member.lead.truoc_khi_tham_gia_lop_hoc,
    );

    if (!existingPreSurvey) {
      return NextResponse.json(
        {
          success: false,
          status: "PRE_SURVEY_REQUIRED",
          message: "Mẹ cần hoàn thành khảo sát trước khi đăng ký buổi tư vấn.",
        },
        { status: 403 },
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

    const pancakeThoiGianThamDu = convertVietnamTimeToPancake(thoiGianThamDu);

    const registrationTime = new Date().toISOString();

    const updatePayload = {
      id: member.leadId,
      link_lop_hoc: selectedClass.meetUrl,
      thoi_gian_tham_du: pancakeThoiGianThamDu,
      thoi_gian_dang_ky_lop: registrationTime,
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

    const updateResult = await parsePancakeResponse(updateResponse);

    if (!updateResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          status: "UPDATE_FAILED",
          message: getPancakeMessage(updateResult),
          pancakeStatus: updateResponse.status,
          pancakeResponse: updateResult,
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
        classId: selectedClass.id,
        linkLopHoc: selectedClass.meetUrl,
        thoiGianThamDu: thoiGianThamDu,
        thoiGianDangKyLop: registrationTime,
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

function convertPancakeBookingTime(value: string): string {
  return shiftHours(value, 7);
}
