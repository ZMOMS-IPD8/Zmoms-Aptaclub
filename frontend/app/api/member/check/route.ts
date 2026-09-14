import { NextRequest, NextResponse } from "next/server";
import { checkMemberByPhone } from "../../../lib/pancake/member";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const phone = String(body?.phone ?? "").trim();

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          registered: false,
          status: "INVALID_PHONE",
          message: "Mẹ vui lòng nhập số điện thoại.",
        },
        { status: 400 },
      );
    }

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

    if (!result.registered) {
      return NextResponse.json({
        success: true,
        registered: false,
        status: "MEMBER_NOT_FOUND",
        message: "Số điện thoại này chưa đăng ký hội viên.",
      });
    }

    return NextResponse.json({
      success: true,
      registered: true,
      status: "MEMBER_FOUND",
      member: {
        leadId: result.leadId,
        name: result.fullName,
        phone: result.phone || cleanPhone,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        registered: false,
        status: "SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi kiểm tra thông tin hội viên.",
      },
      { status: 500 },
    );
  }
}
