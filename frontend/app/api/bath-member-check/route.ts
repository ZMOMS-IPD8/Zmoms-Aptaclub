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

function normalizeBathDateTime(value: string): string {
  return value
    .trim()
    .replace("T", " ")
    .replace(/\s+/g, " ")
    .replace(/Z$/, "")
    .replace(/([+-]\d{2}:\d{2})$/, "")
    .replace(/\.\d+$/, "");
}

function shiftHours(value: string, hours: number): string {
  const normalized = normalizeBathDateTime(value);

  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );

  if (!match) {
    return value;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] ?? "0");

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

function convertPancakeTimeToVietnam(value: string): string {
  return shiftHours(value, 7);
}

function parseBathTime(value: string) {
  const normalized = normalizeBathDateTime(value);
  const vietnamTime = convertPancakeTimeToVietnam(normalized);

  const match = vietnamTime.match(
    /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})(?::\d{2})?$/,
  );

  if (!match) {
    return {
      date: value,
      time: "",
    };
  }

  return {
    date: match[1],
    time: match[2],
  };
}

function isBathTimePassed(value: string): boolean {
  const normalized = normalizeBathDateTime(value);

  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] ?? "0");

  const bookingTimestamp = Date.UTC(year, month - 1, day, hour, minute, second);

  return Date.now() >= bookingTimestamp;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const phone = String(body?.phone ?? "").trim();
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

    const result = await checkMemberByPhone(cleanPhone);

    if (!result.registered || !result.lead) {
      return NextResponse.json({
        success: true,
        registered: false,
        status: "MEMBER_NOT_FOUND",
        message: "Số điện thoại này chưa đăng ký hội viên.",
      });
    }

    const address = getFieldValue(result.lead.dia_chi_tam_be);
    const bathTime = getFieldValue(result.lead.thoi_gian_tam_be);

    const staffName = getFieldValue(result.lead.ten_nhan_vien_tam_be);
    const bathNote = getFieldValue(result.lead.ghi_chu_tam_be);

    const hasBathBooking = Boolean(address && bathTime);

    const hasReview = Boolean(staffName && bathNote);

    const canReview =
      hasBathBooking && !hasReview && isBathTimePassed(bathTime);

    const parsedTime = parseBathTime(bathTime);

    return NextResponse.json({
      success: true,
      registered: true,
      status: hasBathBooking ? "BATH_ALREADY_BOOKED" : "MEMBER_FOUND",
      member: {
        leadId: String(result.leadId),
        name: result.fullName,
        phone: result.phone,
        province: getFieldValue(result.lead.thanh_pho) || undefined,
        dueDate:
          getFieldValue(result.lead.ngay_du_sinh_hoac_ngay_sinh_cua_be) ||
          undefined,
      },
      bathBooking: hasBathBooking
        ? {
            address,
            date: parsedTime.date,
            time: parsedTime.time,
            hasReview,
            canReview,
          }
        : null,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        registered: false,
        status: "SERVER_ERROR",
        message: "Có lỗi xảy ra khi kiểm tra thông tin. Mẹ vui lòng thử lại.",
      },
      { status: 500 },
    );
  }
}
