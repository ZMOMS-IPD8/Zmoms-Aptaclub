// app/api/pancake/check/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  isValidRegistrationReferralCode,
  getRegistrationReferralMapping,
} from "@/lib/referral-codes";

export const runtime = "nodejs";

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

type CheckRequest = {
  fullName?: string;
  phone?: string;
  province?: string;
  babyDate?: string;
  referralCode?: string;
  eventCode?: string;
  consentMember?: boolean | string;
  consentAptaclub?: boolean | string;
  consentMarketing?: boolean | string;
  consentDanone?: boolean | string;
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

  if (!normalizedCode) {
    return [];
  }

  return getRegistrationReferralMapping(normalizedCode);
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

function isEligibleBabyDate(babyDate: string): boolean {
  const selectedDate = parseDate(babyDate);

  if (!selectedDate) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate > today) {
    const latestDueDate = new Date(today);

    latestDueDate.setDate(latestDueDate.getDate() + 84);
    latestDueDate.setHours(0, 0, 0, 0);

    return selectedDate <= latestDueDate;
  }

  const threeMonthsLater = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 3,
    selectedDate.getDate(),
  );

  threeMonthsLater.setHours(0, 0, 0, 0);

  return threeMonthsLater > today;
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

function isTrue(value: unknown): boolean {
  return (
    value === true ||
    String(value ?? "")
      .trim()
      .toLowerCase() === "true"
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckRequest;

    const fullName = String(body.fullName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const province = String(body.province ?? "").trim();
    const babyDate = String(body.babyDate ?? "").trim();

    const referralCode = String(body.referralCode ?? "")
      .trim()
      .toUpperCase();

    const eventCode = String(body.eventCode ?? "")
      .trim()
      .toUpperCase();

    const consentMember = isTrue(body.consentMember);
    const consentAptaclub = isTrue(body.consentAptaclub);
    const consentDanone = isTrue(body.consentDanone);

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

    if (!consentMember) {
      return NextResponse.json(
        {
          success: false,
          status: "CONSENT_REQUIRED",
          message: "Vui lòng đồng ý đăng ký hội viên để tiếp tục.",
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

    if (!parseDate(babyDate) || !isEligibleBabyDate(babyDate)) {
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

    const finalReferralCode = referralCode || "NHS-UNKNOWN";
    const finalEventCode = eventCode || "SD";
    const eligibleForDanoneCRM = consentAptaclub && consentDanone;

    return NextResponse.json({
      success: true,
      status: "ELIGIBLE",
      message: "Thông tin hợp lệ. Có thể tiếp tục tải ảnh minh chứng.",
      leadId: String(leadId),
      phone: cleanPhone,
      referralCode: finalReferralCode,
      eventCode: finalEventCode,
      eligibleForDanoneCRM,
      zaloUrl,
    });
  } catch (error) {
    console.error("[PANCAKE_CHECK_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        status: "SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi kiểm tra thông tin. Vui lòng thử lại.",
      },
      { status: 500 },
    );
  }
}
