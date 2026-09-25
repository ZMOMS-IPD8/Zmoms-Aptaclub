import { NextRequest, NextResponse } from "next/server";
import { isValidReferralCode } from "../../data/referralCodes";

type PancakeLead = {
  id?: string;
  lead_id?: string;
  record_id?: string;
  name?: string | null;
  phone_number?: string | null;
  source?: string | number | null;
  ho_va_ten_lien_he?: string | null | { value?: string | null };
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

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }

  if (value && typeof value === "object" && "value" in value) {
    return String((value as { value?: unknown }).value ?? "").trim();
  }

  return "";
}

function parseDate(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  date.setHours(0, 0, 0, 0);

  return date;
}

function getToday(): Date {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return today;
}

function getMotherStatus(babyDate: string): string | null {
  const date = parseDate(babyDate);
  const today = getToday();

  if (!date) {
    return null;
  }

  return date > today ? "Đang mang thai" : "Đã sinh";
}

function isEligible(babyDate: string) {
  const selectedDate = parseDate(babyDate);
  const today = getToday();

  if (!selectedDate) {
    return {
      valid: false,
      eligible: false,
      status: null,
      message: "Ngày dự sinh hoặc ngày sinh của bé không hợp lệ.",
    };
  }

  if (selectedDate > today) {
    const oneDay = 1000 * 60 * 60 * 24;

    const daysUntilDue = Math.floor(
      (selectedDate.getTime() - today.getTime()) / oneDay,
    );

    const pregnancyDays = 280 - daysUntilDue;

    if (pregnancyDays < 0 || pregnancyDays > 280) {
      return {
        valid: false,
        eligible: false,
        status: "Đang mang thai",
        message:
          "Ngày dự sinh không hợp lệ. Vui lòng kiểm tra lại ngày dự sinh.",
      };
    }

    if (pregnancyDays < 210) {
      const weeks = Math.floor(pregnancyDays / 7);
      const days = pregnancyDays % 7;

      return {
        valid: true,
        eligible: false,
        status: "Đang mang thai",
        message: `Hiện tại tuổi thai của mẹ khoảng ${weeks} tuần ${days} ngày. Chương trình dành cho mẹ từ 30 tuần thai trở lên.`,
      };
    }

    return {
      valid: true,
      eligible: true,
      status: "Đang mang thai",
      message: "",
    };
  }

  const twelveMonthsLater = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 12,
    selectedDate.getDate(),
  );

  if (today >= twelveMonthsLater) {
    let months =
      (today.getFullYear() - selectedDate.getFullYear()) * 12 +
      (today.getMonth() - selectedDate.getMonth());

    if (today.getDate() < selectedDate.getDate()) {
      months--;
    }

    return {
      valid: true,
      eligible: false,
      status: "Đã sinh",
      message: `Bé hiện đã khoảng ${months} tháng tuổi. Chương trình dành cho bé dưới 12 tháng tuổi.`,
    };
  }

  return {
    valid: true,
    eligible: true,
    status: "Đã sinh",
    message: "",
  };
}

async function parsePancakeResponse(
  response: Response,
): Promise<PancakeResponse> {
  const text = await response.text();

  if (!text.trim()) {
    return {};
  }

  try {
    return JSON.parse(text) as PancakeResponse;
  } catch {
    return {
      message: text.slice(0, 500),
    };
  }
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const fullName = String(body?.fullName ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const province = String(body?.province ?? "").trim();
    const babyDate = String(body?.babyDate ?? "").trim();

    const referralCode = String(body?.referralCode ?? "")
      .trim()
      .toUpperCase();

    const consentAptaclub = body?.consentAptaclub === true;
    const consentMarketing = body?.consentMarketing === true;
    const consentDanone = body?.consentDanone === true;

    if (!fullName || !phone || !province || !babyDate) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_DATA",
          message: "Thiếu thông tin bắt buộc.",
        },
        { status: 400 },
      );
    }

    if (!referralCode) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_REFERRAL_CODE",
          message: "Vui lòng nhập mã giới thiệu.",
        },
        { status: 400 },
      );
    }

    if (!isValidReferralCode(referralCode)) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_REFERRAL_CODE",
          message: "Mã giới thiệu không hợp lệ.",
        },
        { status: 400 },
      );
    }

    const workspaceId = process.env.PANCAKE_WORKSPACE_ID;
    const apiKey = process.env.PANCAKE_CRM_API_KEY;
    const zaloUrl = process.env.ZMOMS_ZALO_OA_URL || "";

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

    const cleanPhone = phone.replace(/\D/g, "");
    const cleanFullName = fullName.trim();
    const cleanProvince = province.trim();

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

    const selectedDate = parseDate(babyDate);

    if (!selectedDate) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_DATE",
          message: "Ngày dự sinh hoặc ngày sinh của bé không hợp lệ.",
        },
        { status: 400 },
      );
    }

    const eligibility = isEligible(babyDate);

    if (!eligibility.valid) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_DATE",
          message: eligibility.message,
        },
        { status: 400 },
      );
    }

    if (!eligibility.eligible) {
      return NextResponse.json(
        {
          success: false,
          status: "NOT_ELIGIBLE",
          message: eligibility.message,
        },
        { status: 403 },
      );
    }

    const cleanBabyDate = `${babyDate} 00:00:00`;
    const motherStatus = getMotherStatus(babyDate);
    const registrationTime = new Date().toISOString();

    const zmomsSourceId = "zl_626069465683660973";

    const filter = {
      is_group: false,
      fields: [
        {
          field_name: "phone_number",
          type: "$enter_value",
          value: cleanPhone,
          is_filter_exclude: false,
        },
        {
          field_name: "source",
          type: "$enter_value",
          value: zmomsSourceId,
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

    const checkResult = await parsePancakeResponse(checkResponse);

    if (!checkResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          status: "SEARCH_FAILED",
          message: getPancakeErrorMessage(checkResult, checkResponse),
        },
        { status: checkResponse.status },
      );
    }

    const existingLeads = Array.isArray(checkResult?.data?.entries)
      ? checkResult.data.entries
      : [];

    if (existingLeads.length === 0) {
      return NextResponse.json(
        {
          success: false,
          status: "NOT_IN_ZALO",
          message:
            "Hiện tại bạn chưa tham gia Zalo OA của ZMoms. Vui lòng vào Zalo OA và để lại số điện thoại Zalo của mình để tiếp tục.",
          zaloUrl,
        },
        { status: 403 },
      );
    }

    const lead = existingLeads[0];

    const existingContactName = getFieldValue(lead.ho_va_ten_lien_he);

    if (existingContactName) {
      return NextResponse.json(
        {
          success: false,
          status: "ALREADY_REGISTERED",
          message:
            "Thông tin của bạn đã được đăng ký rồi. Vui lòng liên hệ ZMoms để được hỗ trợ.",
          zaloUrl,
        },
        { status: 409 },
      );
    }

    const leadId = lead.id || lead.lead_id || lead.record_id;

    if (!leadId) {
      return NextResponse.json(
        {
          success: false,
          status: "MISSING_LEAD_ID",
          message: "Không xác định được Lead cần cập nhật trên Pancake.",
        },
        { status: 500 },
      );
    }

    const eligibleForDanoneCRM = consentAptaclub && consentDanone;

    const pancakePayload = {
      id: String(leadId),
      name: String(lead.name ?? "").trim() || cleanFullName,
      phone_number: cleanPhone,
      so_dien_thoai_dang_ky: cleanPhone,
      ho_va_ten_lien_he: cleanFullName,
      ngay_du_sinh_hoac_ngay_sinh_cua_be: cleanBabyDate,
      tinh_trang_me: motherStatus,
      thoi_gian_dang_ky: registrationTime,
      thanh_pho: cleanProvince,
      ma_gioi_thieu_dang_ky: referralCode,
      da_doc_chinh_sach_aptamil: consentDanone ? "true" : "false",
      dong_y_nhan_thong_bao: consentMarketing ? "true" : "false",
      chia_se_de_dang_ky_aptaclub: consentAptaclub ? "true" : "false",
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
      body: JSON.stringify(pancakePayload),
    });

    const updateResult = await parsePancakeResponse(updateResponse);

    if (!updateResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          status: "UPDATE_FAILED",
          message: getPancakeErrorMessage(updateResult, updateResponse),
          zaloUrl,
        },
        { status: updateResponse.status },
      );
    }

    return NextResponse.json({
      success: true,
      status: "UPDATED",
      message: "Thông tin của bạn đã được cập nhật thành công.",
      eligibleForDanoneCRM,
      zaloUrl,
      pancake: updateResult,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        status: "SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.",
      },
      { status: 500 },
    );
  }
}
