import { NextRequest, NextResponse } from "next/server";
import { checkMemberByPhone } from "../../../lib/pancake/member";

type ComboType = "small" | "large";

type VerifyPaymentBody = {
  phone: string;
  referralCode: string;
  combo: ComboType;
  orderCode: string;
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
    const orderCode = String(body?.orderCode ?? "").trim();

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

    if (!orderCode || !/^ZMOMS-\d+$/.test(orderCode)) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          message: "Mã đơn hàng không hợp lệ.",
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

    const leadOrderCode = String(lead.ma_don_hang ?? "").trim();

    if (!leadOrderCode || leadOrderCode !== orderCode) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          orderMatched: false,
          message: "Mã đơn hàng không khớp với số điện thoại.",
        },
        { status: 409 },
      );
    }

    const paymentStatus = String(lead.trang_thai_thanh_toan ?? "").trim();

    if (paymentStatus === "Đã thanh toán") {
      return NextResponse.json({
        success: true,
        verified: true,
        orderMatched: true,
        alreadyPurchased: false,
        paymentStatus,
        phone,
        fullName: member.fullName,
        referralCode,
        combo,
        orderCode,
        zaloUrl,
      });
    }

    if (paymentStatus === "Hoàn tiền") {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          orderMatched: true,
          alreadyPurchased: false,
          paymentStatus,
          phone,
          fullName: member.fullName,
          referralCode,
          combo,
          orderCode,
          zaloUrl,
          message:
            "Đơn hàng trước đó đã được hoàn tiền. Mẹ vui lòng liên hệ Zalo OA để được hỗ trợ.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      orderMatched: true,
      alreadyPurchased: false,
      paymentStatus: paymentStatus || "Chưa thanh toán",
      phone,
      fullName: member.fullName,
      referralCode,
      combo,
      orderCode,
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
