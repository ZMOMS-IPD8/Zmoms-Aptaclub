import { NextRequest, NextResponse } from "next/server";

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
  [key: string]: unknown;
};

const REFERRAL_CODE_REGEX = /^(PG|NHS|SPA|SALE)([0-9]{3})$/;

function getFieldValue(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value && typeof value === "object" && "value" in value) {
    return String((value as { value?: unknown }).value ?? "").trim();
  }

  return "";
}

function isValidReferralCode(code: string) {
  if (!code) {
    return true;
  }

  const match = code.match(REFERRAL_CODE_REGEX);

  if (!match) {
    return false;
  }

  const number = Number(match[2]);

  return number >= 1 && number <= 999;
}

function getMotherStatus(babyDate: string) {
  const dueDate = new Date(`${babyDate}T00:00:00`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return dueDate >= today ? "Đang mang thai" : "Đã sinh";
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

    const workspaceId = process.env.PANCAKE_WORKSPACE_ID;
    const apiKey = process.env.PANCAKE_API_KEY;
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

    const dateMatch = babyDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (!dateMatch) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_DATE",
          message: "Định dạng ngày không hợp lệ.",
        },
        { status: 400 },
      );
    }

    const [, year, month, day] = dateMatch;

    const cleanBabyDate = `${year}-${month}-${day} 00:00:00`;

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

    const checkResult = (await checkResponse.json()) as PancakeResponse;

    if (!checkResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          status: "SEARCH_FAILED",
          message:
            "Không thể kiểm tra thông tin trên Pancake. Vui lòng thử lại.",
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

    const updateResult = (await updateResponse.json()) as PancakeResponse;

    if (!updateResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          status: "UPDATE_FAILED",
          message:
            updateResult?.message ||
            "Cập nhật thông tin thất bại. Vui lòng thử lại hoặc liên hệ ZMoms để được hỗ trợ.",
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
  } catch {
    return NextResponse.json(
      {
        success: false,
        status: "SERVER_ERROR",
        message: "Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.",
      },
      { status: 500 },
    );
  }
}
