import { NextRequest, NextResponse } from "next/server";
import { checkMemberByPhone } from "../../lib/pancake/member";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const phone = String(body?.phone ?? "").trim();

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          registered: false,
          purchased: false,
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
          purchased: false,
          message:
            "Số điện thoại không đúng định dạng. Mẹ vui lòng kiểm tra lại.",
        },
        { status: 400 },
      );
    }

    const zaloUrl = process.env.ZMOMS_ZALO_OA_URL || "";

    const member = await checkMemberByPhone(cleanPhone);

    if (!member.registered || !member.lead) {
      return NextResponse.json({
        success: true,
        registered: false,
        purchased: false,
        paymentStatus: null,
        zaloUrl,
      });
    }

    const paymentStatus = String(
      member.lead.trang_thai_thanh_toan ?? "",
    ).trim();

    const purchased = paymentStatus === "Đã thanh toán";

    return NextResponse.json({
      success: true,
      registered: true,
      purchased,
      paymentStatus: paymentStatus || "Chưa thanh toán",
      member: {
        leadId: member.leadId,
        name: member.fullName,
        phone: member.phone || cleanPhone,
      },
      zaloUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        registered: false,
        purchased: false,
        paymentStatus: null,
        message:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi kiểm tra thông tin.",
        zaloUrl: process.env.ZMOMS_ZALO_OA_URL || "",
      },
      { status: 500 },
    );
  }
}
