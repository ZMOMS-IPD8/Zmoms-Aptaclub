import { NextRequest, NextResponse } from "next/server";
import { isValidRegistrationReferralCode } from "../../data/referralCodes";
import referralEvents from "../../data/referralEvents.json";

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

function getEventCodes(referralCode: string): string[] {
  const normalizedCode = referralCode.trim().toUpperCase();
  const events = referralEvents as Record<string, string[]>;

  if (!normalizedCode) {
    return [];
  }

  return Array.isArray(events[normalizedCode]) ? events[normalizedCode] : [];
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

function getMotherStatus(babyDate: string): string | null {
  const date = parseDate(babyDate);

  if (!date) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date > today ? "Đang mang thai" : "Đã sinh";
}

function isEligibleBabyDate(babyDate: string): boolean {
  const selectedDate = parseDate(babyDate);

  if (!selectedDate) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate > today) {
    const latestDueDate = new Date(today);

    latestDueDate.setMonth(latestDueDate.getMonth() + 9);
    latestDueDate.setHours(0, 0, 0, 0);

    return selectedDate <= latestDueDate;
  }

  const secondBirthday = new Date(
    selectedDate.getFullYear() + 2,
    selectedDate.getMonth(),
    selectedDate.getDate(),
  );

  secondBirthday.setHours(0, 0, 0, 0);

  return secondBirthday > today;
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
    const formData = await req.formData();

    const fullName = String(formData.get("fullName") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const province = String(formData.get("province") ?? "").trim();
    const babyDate = String(formData.get("babyDate") ?? "").trim();

    const referralCode = String(formData.get("referralCode") ?? "")
      .trim()
      .toUpperCase();

    const eventCode = String(formData.get("eventCode") ?? "")
      .trim()
      .toUpperCase();

    const consentAptaclub =
      String(formData.get("consentAptaclub") ?? "") === "true";

    const consentMarketing =
      String(formData.get("consentMarketing") ?? "") === "true";

    const consentDanone =
      String(formData.get("consentDanone") ?? "") === "true";

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

    if (referralCode && !isValidRegistrationReferralCode(referralCode)) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_REFERRAL_CODE",
          message: "Mã giới thiệu không hợp lệ.",
        },
        { status: 400 },
      );
    }

    if (!referralCode && eventCode) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_EVENT_CODE",
          message: "Không thể chọn mã sự kiện khi chưa có mã giới thiệu.",
        },
        { status: 400 },
      );
    }

    if (referralCode) {
      const availableEventCodes = getEventCodes(referralCode);

      if (availableEventCodes.length > 0 && !eventCode) {
        return NextResponse.json(
          {
            success: false,
            status: "INVALID_EVENT_CODE",
            message: "Vui lòng chọn mã sự kiện.",
          },
          { status: 400 },
        );
      }

      if (eventCode && !availableEventCodes.includes(eventCode)) {
        return NextResponse.json(
          {
            success: false,
            status: "INVALID_EVENT_CODE",
            message: "Mã sự kiện không phù hợp với mã giới thiệu.",
          },
          { status: 400 },
        );
      }
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

    if (!selectedDate || !isEligibleBabyDate(babyDate)) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_DATE",
          message:
            "Thông tin ngày dự sinh hoặc ngày sinh của bé chưa phù hợp để đăng ký.",
        },
        { status: 400 },
      );
    }

    const cleanBabyDate = `${babyDate} 00:00:00`;
    const motherStatus = getMotherStatus(babyDate);
    const registrationTime = new Date().toISOString();

    const finalReferralCode = referralCode || "NHS-UNKNOWN";
    const finalEventCode = eventCode || "SD";

    const teamThuThap = finalReferralCode.startsWith("C")
      ? "CDB"
      : finalReferralCode.startsWith("Z") || finalReferralCode === "NHS-UNKNOWN"
        ? "ZM"
        : "";

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
      `https://crm.pancake.vn/api/workspaces/${workspaceId}/lead/records` +
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
      ma_gioi_thieu_dang_ky: finalReferralCode,
      ma_su_kien: finalEventCode,
      team_thu_thap: teamThuThap,
      dong_y_dang_ky_hoi_vien: "true",
      da_doc_chinh_sach_aptamil: consentDanone ? "true" : "false",
      dong_y_nhan_thong_bao: consentMarketing ? "true" : "false",
      chia_se_de_dang_ky_aptaclub: consentAptaclub ? "true" : "false",
    };

    const updateUrl =
      `https://crm.pancake.vn/api/workspaces/${workspaceId}/lead/records` +
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
