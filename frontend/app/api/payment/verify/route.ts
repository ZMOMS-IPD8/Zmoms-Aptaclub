import { NextRequest, NextResponse } from "next/server";
import { validateReferralCode } from "../../../deal/data/referralCodes";
import { checkMemberByPhone } from "../../../lib/pancake/member";

type ComboType = "small" | "large";

type VerifyPaymentBody = {
  phone: string;
  referralCode: string;
  combo: ComboType;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as VerifyPaymentBody;

    const phone = String(body?.phone ?? "")
      .trim()
      .replace(/\D/g, "");

    const referralCode = String(body?.referralCode ?? "")
      .trim()
      .toUpperCase();

    const combo = body?.combo;

    if (!/^0\d{9}$/.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          message: "Số điện thoại không hợp lệ.",
        },
        { status: 400 },
      );
    }

    if (!validateReferralCode(referralCode)) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          message: "Mã giới thiệu không hợp lệ.",
        },
        { status: 400 },
      );
    }

    if (combo !== "small" && combo !== "large") {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          message: "Combo không hợp lệ.",
        },
        { status: 400 },
      );
    }

    const zaloUrl = process.env.ZMOMS_ZALO_OA_URL || "";

    const member = await checkMemberByPhone(phone);

    if (!member.registered || !member.lead) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          registered: false,
          message: "Số điện thoại chưa đăng ký hội viên.",
        },
        { status: 403 },
      );
    }

    const lead = member.lead;

    const orderDate = String(lead.ngay_dat_hang ?? "").trim();

    if (orderDate) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          alreadyPurchased: true,
          zaloUrl,
          message: "Số điện thoại này đã đặt hàng.",
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      alreadyPurchased: false,
      phone,
      referralCode,
      combo,
      zaloUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        verified: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể xác thực thông tin đơn hàng.",
      },
      { status: 500 },
    );
  }
}
