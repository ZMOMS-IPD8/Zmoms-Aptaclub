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

function shiftHours(value: string, hours: number): string {
  const match = value.match(
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

function convertPancakeTimeToVietnam(value: string): string {
  return shiftHours(value, 7);
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
    return "Pancake không thể cập nhật thông tin đăng ký chăm sóc.";
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

  return "Pancake không thể cập nhật thông tin đăng ký chăm sóc.";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const leadId = String(body?.leadId ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const booking = body?.booking;

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

    if (!booking || typeof booking !== "object") {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_BOOKING",
          message: "Thông tin đăng ký không hợp lệ.",
        },
        { status: 400 },
      );
    }

    const address = String(booking?.address ?? "").trim();
    const date = String(booking?.date ?? "").trim();
    const time = String(booking?.time ?? "").trim();

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_ADDRESS",
          message: "Mẹ vui lòng nhập địa chỉ tắm bé.",
        },
        { status: 400 },
      );
    }

    if (!date || !time) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_DATETIME",
          message: "Mẹ vui lòng chọn ngày và giờ chăm sóc.",
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

    const existingAddress = getFieldValue(member.lead.dia_chi_tam_be);

    const existingTime = getFieldValue(member.lead.thoi_gian_tam_be);

    const hasBathBooking = Boolean(existingAddress && existingTime);

    if (hasBathBooking) {
      return NextResponse.json(
        {
          success: false,
          status: "BATH_ALREADY_BOOKED",
          message:
            "Mẹ đã đăng ký buổi tư vấn và chăm sóc tại nhà trước đó. Mẹ không cần đăng ký lại.",
          booking: {
            address: existingAddress,
            date: existingTime.substring(0, 10),
            time: convertPancakeTimeToVietnam(existingTime).substring(11, 16),
          },
        },
        { status: 409 },
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

    // date + time là giờ Việt Nam
    const vietnamBathTime = `${date} ${time}:00`;

    // Pancake lưu theo UTC -> trừ 7 giờ
    const pancakeBathTime = convertVietnamTimeToPancake(vietnamBathTime);

    // Thời điểm mẹ thực hiện đăng ký
    const registrationTime = new Date().toISOString();

    const updatePayload = {
      id: leadId,
      dia_chi_tam_be: address,
      thoi_gian_tam_be: pancakeBathTime,
      thoi_gian_dang_ky_tam_be: registrationTime,
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
          message: getPancakeMessage(result),
          pancakeStatus: response.status,
          pancakeResponse: result,
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      status: "BATH_BOOKED",
      message: "Đăng ký buổi tư vấn và chăm sóc tại nhà thành công.",
      leadId,
      booking: {
        address,
        date,
        time,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        status: "SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi đăng ký chăm sóc.",
      },
      { status: 500 },
    );
  }
}
