import { NextRequest, NextResponse } from "next/server";
import { checkMemberByPhone } from "../../../lib/pancake/member";

const PAYMENT_STATUSES = [
  "Chưa thanh toán",
  "Đã thanh toán",
  "Thanh toán lỗi",
  "Thanh toán thiếu",
  "Hoàn tiền",
] as const;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const phone = String(searchParams.get("phone") ?? "")
      .trim()
      .replace(/\D/g, "");

    const orderCode = String(searchParams.get("orderCode") ?? "").trim();

    if (!/^0\d{9}$/.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          paid: false,
          message: "Số điện thoại không hợp lệ.",
        },
        { status: 400 },
      );
    }

    if (!orderCode || !/^ZMOMS-\d+$/.test(orderCode)) {
      return NextResponse.json(
        {
          success: false,
          paid: false,
          message: "Mã đơn hàng không hợp lệ.",
        },
        { status: 400 },
      );
    }

    const member = await checkMemberByPhone(phone);

    if (!member.registered || !member.lead) {
      return NextResponse.json(
        {
          success: false,
          paid: false,
          message: "Không tìm thấy thông tin hội viên.",
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
          paid: false,
          orderMatched: false,
          message: "Mã đơn hàng không khớp với số điện thoại.",
        },
        { status: 409 },
      );
    }

    const rawPaymentStatus = String(lead.trang_thai_thanh_toan ?? "").trim();

    const paymentStatus = PAYMENT_STATUSES.includes(
      rawPaymentStatus as (typeof PAYMENT_STATUSES)[number],
    )
      ? rawPaymentStatus
      : "Chưa thanh toán";

    const paid = paymentStatus === "Đã thanh toán";

    return NextResponse.json({
      success: true,
      paid,
      orderMatched: true,
      paymentStatus,
      orderCode,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        paid: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể kiểm tra trạng thái thanh toán.",
      },
      { status: 500 },
    );
  }
}
