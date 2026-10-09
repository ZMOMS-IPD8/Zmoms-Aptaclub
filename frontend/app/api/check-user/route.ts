import { NextRequest, NextResponse } from "next/server";
import { checkUserByPhone } from "../../lib/pancake/pancake-user-check";

const DELIVERY_STATUS = "Giao thành công";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const cleanPhone = String(body?.phone ?? "")
      .trim()
      .replace(/\D/g, "");

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

    const result = await checkUserByPhone(cleanPhone);

    if (result.registered && result.purchased) {
      return NextResponse.json({
        success: true,
        status: "REGISTERED_AND_PURCHASED",
        registered: true,
        purchased: true,
        purchasedWithoutRegistration: false,
        deliveryStatus: DELIVERY_STATUS,
      });
    }

    if (result.purchasedWithoutRegistration) {
      return NextResponse.json({
        success: true,
        status: "PURCHASED_WITHOUT_REGISTRATION",
        registered: false,
        purchased: true,
        purchasedWithoutRegistration: true,
        deliveryStatus: DELIVERY_STATUS,
      });
    }

    if (result.registered && !result.purchased) {
      return NextResponse.json({
        success: true,
        status: "REGISTERED_NOT_PURCHASED",
        registered: true,
        purchased: false,
        purchasedWithoutRegistration: false,
        deliveryStatus: "",
      });
    }

    return NextResponse.json({
      success: true,
      status: "NOT_REGISTERED_NOT_PURCHASED",
      registered: false,
      purchased: false,
      purchasedWithoutRegistration: false,
      deliveryStatus: "",
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
