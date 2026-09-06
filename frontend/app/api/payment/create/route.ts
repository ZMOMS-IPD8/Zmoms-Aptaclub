import { NextRequest, NextResponse } from "next/server";
import { createPayment } from "../../../lib/payment/service";

type Body = {
  orderCode: string;
  amount: number;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;

    const orderCode = String(body.orderCode ?? "").trim();
    const amount = Number(body.amount);

    if (!orderCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu mã đơn hàng.",
        },
        { status: 400 },
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Số tiền không hợp lệ.",
        },
        { status: 400 },
      );
    }

    const payment = await createPayment({
      orderCode,
      amount,
      description: orderCode,
    });

    return NextResponse.json({
      success: true,
      payment,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Không thể tạo thanh toán.",
      },
      { status: 500 },
    );
  }
}
