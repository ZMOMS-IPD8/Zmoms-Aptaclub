import { NextRequest, NextResponse } from "next/server";
import { checkMemberByPhone } from "../../lib/pancake/member";

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const phone = String(body?.phone ?? "").trim();
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

    const member = await checkMemberByPhone(cleanPhone);

    // Không có Lead
    if (!member.lead) {
      return NextResponse.json({
        success: true,
        status: "CHECKED",
        registered: false,
        purchased: false,
      });
    }

    // Có Lead → luôn kiểm tra tình trạng giao hàng
    const deliveryStatus = getFieldValue(member.lead.trang_thai_giao_hang);

    const purchased = deliveryStatus.toLowerCase() === "giao thành công";

    const registered = Boolean(member.registered);

    return NextResponse.json({
      success: true,
      status: "CHECKED",
      registered,
      purchased,
      deliveryStatus,
    });
  } catch (error) {
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
