import { NextRequest, NextResponse } from "next/server";
import { checkMemberByPhone } from "../../lib/pancake/member";

export const runtime = "nodejs";

const EBOOK_NAME = "CHECKLIST 100 KỸ NĂNG CHO BÉ";

type ApiResult = {
  success?: unknown;
  status?: unknown;
  message?: unknown;
  error?: unknown;
  [key: string]: unknown;
};

function getFieldValue(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }

  if (value && typeof value === "object" && "value" in value) {
    const fieldValue = (value as { value?: unknown }).value;

    if (typeof fieldValue === "string" || typeof fieldValue === "number") {
      return String(fieldValue).trim();
    }
  }

  return "";
}

async function parseResponse(response: Response): Promise<unknown> {
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

function isApiResult(value: unknown): value is ApiResult {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function getApiMessage(result: unknown, fallback: string): string {
  if (!isApiResult(result)) {
    return fallback;
  }

  if (typeof result.message === "string" && result.message.trim()) {
    return result.message.trim();
  }

  if (typeof result.error === "string" && result.error.trim()) {
    return result.error.trim();
  }

  return fallback;
}

function isExplicitApiFailure(result: unknown): boolean {
  if (!isApiResult(result)) {
    return false;
  }

  if (result.success === false) {
    return true;
  }

  if (typeof result.error === "string" && result.error.trim()) {
    return true;
  }

  const status = String(result.status ?? "")
    .trim()
    .toUpperCase();

  return [
    "ERROR",
    "FAILED",
    "FAILURE",
    "INVALID_ACTION",
    "UNAUTHORIZED",
    "SERVER_ERROR",
  ].includes(status);
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function jsonError(
  status: number,
  code: string,
  message: string,
  extra: Record<string, unknown> = {},
) {
  return NextResponse.json(
    {
      success: false,
      status: code,
      message,
      ...extra,
    },
    { status },
  );
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return jsonError(400, "INVALID_REQUEST", "Dữ liệu gửi lên không hợp lệ.");
    }

    if (!isApiResult(body)) {
      return jsonError(400, "INVALID_REQUEST", "Dữ liệu gửi lên không hợp lệ.");
    }

    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();

    const cleanPhone = phone.replace(/\D/g, "");

    if (!/^0\d{9}$/.test(cleanPhone)) {
      return jsonError(
        400,
        "INVALID_PHONE",
        "Số điện thoại không đúng định dạng.",
      );
    }

    if (!isValidEmail(email)) {
      return jsonError(400, "INVALID_EMAIL", "Email không đúng định dạng.");
    }

    const member = await checkMemberByPhone(cleanPhone);

    if (!member.registered || !member.lead) {
      return jsonError(
        404,
        "MEMBER_NOT_FOUND",
        "Số điện thoại này chưa đăng ký hội viên.",
      );
    }

    const leadId = String(member.leadId ?? "").trim();

    if (!leadId) {
      return jsonError(
        400,
        "INVALID_LEAD_ID",
        "Không xác định được thông tin hội viên.",
      );
    }

    const existingEmail = getFieldValue(member.lead.email_nhan_ebook);

    const existingReceivedAt = getFieldValue(member.lead.thoi_gian_nhan_ebook);

    if (existingEmail) {
      return NextResponse.json({
        success: true,
        status: "EBOOK_ALREADY_RECEIVED",
        message: "Mẹ đã nhận Ebook trước đó.",
        leadId,
        email: existingEmail,
        receivedAt: existingReceivedAt || null,
      });
    }

    const workspaceId = process.env.PANCAKE_WORKSPACE_ID;
    const apiKey = process.env.PANCAKE_CRM_API_KEY;
    const gasUrl = process.env.EBOOK_APPS_SCRIPT_URL;
    const gasSecret = process.env.EBOOK_APPS_SCRIPT_SECRET;

    if (!workspaceId || !apiKey) {
      return jsonError(500, "CONFIG_ERROR", "Chưa cấu hình Pancake CRM API.");
    }

    if (!gasUrl || !gasSecret) {
      return jsonError(
        500,
        "CONFIG_ERROR",
        "Chưa cấu hình Google Apps Script.",
      );
    }

    const registrationTime = new Date().toISOString();

    let gasResponse: Response;
    let gasResult: unknown;

    try {
      gasResponse = await fetch(gasUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          secret: gasSecret,
          action: "share_ebook",
          leadId,
          phone: cleanPhone,
          email,
          ebook: EBOOK_NAME,
        }),
      });

      gasResult = await parseResponse(gasResponse);
    } catch {
      return jsonError(
        502,
        "EBOOK_SHARE_FAILED",
        "Không thể kết nối dịch vụ chia sẻ Ebook. Mẹ vui lòng thử lại.",
        { leadId },
      );
    }

    if (
      !gasResponse.ok ||
      !isApiResult(gasResult) ||
      gasResult.success !== true ||
      isExplicitApiFailure(gasResult)
    ) {
      return jsonError(
        502,
        "EBOOK_SHARE_FAILED",
        getApiMessage(gasResult, "Google Apps Script không thể chia sẻ Ebook."),
        {
          leadId,
          upstreamStatus: gasResponse.status,
          upstreamCode: isApiResult(gasResult)
            ? String(gasResult.status ?? "")
            : "",
        },
      );
    }

    const updatePayload = {
      id: leadId,
      email_nhan_ebook: email,
      thoi_gian_nhan_ebook: registrationTime,
    };

    const updateUrl =
      `https://crm.pancake.vn/api/workspaces/` +
      `${encodeURIComponent(workspaceId)}/lead/records` +
      `?api_key=${encodeURIComponent(apiKey)}`;

    let updateResponse: Response;
    let updateResult: unknown;

    try {
      updateResponse = await fetch(updateUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify(updatePayload),
      });

      updateResult = await parseResponse(updateResponse);
    } catch {
      return jsonError(
        502,
        "PANCAKE_UPDATE_FAILED",
        "Ebook có thể đã được chia sẻ, nhưng chưa cập nhật được hồ sơ. Vui lòng kiểm tra Pancake trước khi thử lại.",
        {
          leadId,
          email,
          ebookShared: true,
        },
      );
    }

    if (!updateResponse.ok || isExplicitApiFailure(updateResult)) {
      return jsonError(
        502,
        "PANCAKE_UPDATE_FAILED",
        "Ebook có thể đã được chia sẻ, nhưng Pancake chưa xác nhận cập nhật thành công. Vui lòng kiểm tra hồ sơ trước khi thử lại.",
        {
          leadId,
          email,
          ebookShared: true,
          pancakeStatus: updateResponse.status,
          pancakeMessage: getApiMessage(
            updateResult,
            "Pancake chưa xác nhận cập nhật thành công.",
          ),
        },
      );
    }

    return NextResponse.json({
      success: true,
      status: "EBOOK_RECEIVED",
      message: "Ebook đã được chia sẻ đến email của mẹ.",
      leadId,
      email,
      receivedAt: registrationTime,
    });
  } catch {
    return jsonError(
      500,
      "SERVER_ERROR",
      "Có lỗi xảy ra khi xử lý yêu cầu. Mẹ vui lòng thử lại.",
    );
  }
}
