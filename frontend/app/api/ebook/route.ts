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

function getPancakeMessage(result: unknown): string {
  if (!result || typeof result !== "object") {
    return "Pancake không thể cập nhật thông tin nhận Ebook.";
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

  return "Pancake không thể cập nhật thông tin nhận Ebook.";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const phone = String(body?.phone ?? "").trim();
    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();

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

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_EMAIL",
          message: "Email không đúng định dạng.",
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
          message: "Số điện thoại này chưa đăng ký hội viên.",
        },
        { status: 404 },
      );
    }

    const leadId = String(member.leadId ?? "").trim();

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
      return NextResponse.json(
        {
          success: false,
          status: "CONFIG_ERROR",
          message: "Chưa cấu hình Pancake CRM API.",
        },
        { status: 500 },
      );
    }

    if (!gasUrl || !gasSecret) {
      return NextResponse.json(
        {
          success: false,
          status: "CONFIG_ERROR",
          message: "Chưa cấu hình Google Apps Script.",
        },
        { status: 500 },
      );
    }

    const registrationTime = new Date().toISOString();

    const gasResponse = await fetch(gasUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: gasSecret,
        leadId,
        phone: cleanPhone,
        email,
        ebook: "CHECKLIST 100 KỸ NĂNG CHO BÉ",
      }),
    });

    const gasResult = await parseResponse(gasResponse);

    const gasSuccess =
      gasResult && typeof gasResult === "object" && "success" in gasResult
        ? Boolean((gasResult as { success?: unknown }).success)
        : false;

    if (!gasResponse.ok || !gasSuccess) {
      return NextResponse.json(
        {
          success: false,
          status: "EBOOK_SHARE_FAILED",
          message:
            gasResult && typeof gasResult === "object" && "message" in gasResult
              ? String(
                  (gasResult as { message?: unknown }).message ??
                    "Không thể chia sẻ Ebook.",
                )
              : "Không thể chia sẻ Ebook.",
          leadId,
        },
        { status: 502 },
      );
    }

    const updatePayload = {
      id: leadId,
      email_nhan_ebook: email,
      thoi_gian_nhan_ebook: registrationTime,
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

    const updateResult = await parseResponse(updateResponse);

    if (!updateResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          status: "PANCAKE_UPDATE_FAILED",
          message: getPancakeMessage(updateResult),
          pancakeStatus: updateResponse.status,
          pancakeResponse: updateResult,
        },
        { status: updateResponse.status },
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
    return NextResponse.json(
      {
        success: false,
        status: "SERVER_ERROR",
        message: "Có lỗi xảy ra khi xử lý yêu cầu. Mẹ vui lòng thử lại.",
      },
      { status: 500 },
    );
  }
}
