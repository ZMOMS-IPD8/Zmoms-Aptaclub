import { NextRequest, NextResponse } from "next/server";
import { checkMemberByPhone } from "../../lib/pancake/member";
import {
  getFieldValue,
  isClassStarted,
  normalizeClassDateTime,
} from "../../lib/pancake/classTime";

const VALID_GROUPS = ["Nhóm A", "Nhóm B", "Nhóm C"];

function convertPancakeBookingTime(value: string): string {
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

  const adjusted = new Date(timestamp + 7 * 60 * 60 * 1000);

  return (
    `${adjusted.getUTCFullYear().toString().padStart(4, "0")}-` +
    `${(adjusted.getUTCMonth() + 1).toString().padStart(2, "0")}-` +
    `${adjusted.getUTCDate().toString().padStart(2, "0")} ` +
    `${adjusted.getUTCHours().toString().padStart(2, "0")}:` +
    `${adjusted.getUTCMinutes().toString().padStart(2, "0")}:` +
    `${adjusted.getUTCSeconds().toString().padStart(2, "0")}`
  );
}

async function parsePancakeResponse(response: Response): Promise<{
  success?: boolean;
  message?: string;
  error?: string;
  [key: string]: unknown;
}> {
  const text = await response.text();

  if (!text.trim()) {
    return {};
  }

  try {
    return JSON.parse(text) as {
      success?: boolean;
      message?: string;
      error?: string;
      [key: string]: unknown;
    };
  } catch {
    return {
      message: text.slice(0, 500),
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const leadId = String(body?.leadId ?? "").trim();
    const survey = body?.survey;

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

    if (!survey || typeof survey !== "object") {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_SURVEY",
          message: "Dữ liệu đánh giá không hợp lệ.",
        },
        { status: 400 },
      );
    }

    const rating = String(survey?.danhGia?.rating ?? "").trim();
    const group = String(survey?.danhGia?.group ?? "").trim();
    const careAtHome = String(survey?.danhGia?.careAtHome ?? "").trim();
    const feedback = String(survey?.danhGia?.feedback ?? "").trim();

    if (!rating) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_RATING",
          message: "Chưa có đánh giá buổi học.",
        },
        { status: 400 },
      );
    }

    if (!VALID_GROUPS.includes(group)) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_GROUP",
          message: "Phân loại sau buổi học không hợp lệ.",
        },
        { status: 400 },
      );
    }

    if (!careAtHome) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_CARE_AT_HOME",
          message: "Chưa có thông tin nhu cầu chăm sóc tại nhà.",
        },
        { status: 400 },
      );
    }

    const phone = String(survey?.member?.phone ?? "").trim();
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

    const existingLink = getFieldValue(member.lead.link_lop_hoc);

    const pancakeExistingTime = getFieldValue(member.lead.thoi_gian_tham_du);

    const existingTime = convertPancakeBookingTime(pancakeExistingTime);

    const hasBooking = Boolean(existingLink) && Boolean(pancakeExistingTime);

    if (!hasBooking) {
      return NextResponse.json(
        {
          success: false,
          status: "BOOKING_REQUIRED",
          message: "Mẹ cần đăng ký buổi tư vấn trước khi đánh giá buổi học.",
        },
        { status: 403 },
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
          message: "Mẹ cần hoàn thành khảo sát trước khi tham gia lớp học.",
        },
        { status: 403 },
      );
    }

    const existingPostRating = getFieldValue(member.lead.post_rating);

    if (existingPostRating) {
      return NextResponse.json(
        {
          success: false,
          status: "POST_SURVEY_ALREADY_COMPLETED",
          message:
            "Mẹ đã hoàn thành đánh giá trước đó. Mẹ không cần thực hiện lại.",
        },
        { status: 409 },
      );
    }

    if (!isClassStarted(existingTime)) {
      return NextResponse.json(
        {
          success: false,
          status: "CLASS_NOT_STARTED",
          message: "Mẹ chỉ có thể đánh giá sau khi buổi tư vấn bắt đầu.",
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

    const surveyText = [
      "===== KHẢO SÁT SAU KHI THAM GIA LỚP HỌC =====",
      "",
      `Họ tên: ${survey?.member?.name ?? ""}`,
      `Số điện thoại: ${survey?.member?.phone ?? ""}`,
      "",
      "I. ĐÁNH GIÁ BUỔI HỌC",
      `Đánh giá: ${rating}/5`,
      `Phân loại: ${group}`,
      `Nhu cầu chăm sóc/hỗ trợ tại nhà: ${careAtHome}`,
      "",
      "II. GÓP Ý",
      feedback || "Không có",
      "",
      "III. THÔNG TIN BUỔI HỌC",
      `Thời gian tham dự: ${existingTime}`,
      `Link lớp học: ${existingLink}`,
      "",
      `Thời gian gửi: ${survey?.submittedAt ?? ""}`,
    ].join("\n");

    const updatePayload = {
      id: leadId,
      post_rating: rating,
      post_group: group,
      nhu_cau_cham_soc_tai_nha: careAtHome,
      sau_khi_tham_gia_lop_hoc: surveyText,
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

    const result = await parsePancakeResponse(response);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          status: "UPDATE_FAILED",
          message:
            result?.message ||
            result?.error ||
            "Pancake không thể lưu thông tin đánh giá.",
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      status: "POST_SURVEY_SAVED",
      message: "Đã lưu đánh giá thành công.",
      leadId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        status: "SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi lưu đánh giá.",
      },
      { status: 500 },
    );
  }
}
