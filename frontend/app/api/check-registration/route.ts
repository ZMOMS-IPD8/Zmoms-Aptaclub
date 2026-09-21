import { NextRequest, NextResponse } from "next/server";
import { isValidReferralCode } from "../../data/referralCodes";
import { checkMemberByPhone } from "../../lib/pancake/member";

const REFERRAL_DISCOUNT = 300000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const phone = String(body?.phone ?? "").trim();

    const referralCode = String(body?.referralCode ?? "")
      .trim()
      .toUpperCase();

    const hasReferralCode = Boolean(referralCode);

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          registered: false,
          purchased: false,
          discountAmount: 0,
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
          discountAmount: 0,
          message:
            "Số điện thoại không đúng định dạng. Mẹ vui lòng kiểm tra lại.",
        },
        { status: 400 },
      );
    }

    if (hasReferralCode && !isValidReferralCode(referralCode)) {
      return NextResponse.json(
        {
          success: false,
          registered: false,
          purchased: false,
          discountAmount: 0,
          message: "Mã giới thiệu không hợp lệ. Mẹ vui lòng kiểm tra lại.",
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
        discountAmount: 0,
        zaloUrl,
      });
    }

    const paymentStatus = String(
      member.lead.trang_thai_thanh_toan ?? "",
    ).trim();

    const purchased = paymentStatus === "Đã thanh toán";

    const discountAmount =
      !purchased && hasReferralCode ? REFERRAL_DISCOUNT : 0;

    return NextResponse.json({
      success: true,
      registered: true,
      purchased,
      paymentStatus: paymentStatus || "Chưa thanh toán",
      discountAmount,
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
        discountAmount: 0,
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
