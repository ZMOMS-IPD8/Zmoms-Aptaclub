import { NextRequest, NextResponse } from "next/server";
import {
  checkMemberByPhone,
  findDeliveredOrderByPhone,
} from "../../lib/pancake/member";

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
    const deliveredOrder = await findDeliveredOrderByPhone(cleanPhone);

    const registered = member.registered;
    const purchased = Boolean(deliveredOrder);
    const purchasedWithoutRegistration = purchased && !registered;

    if (registered && purchased) {
      return NextResponse.json({
        success: true,
        status: "REGISTERED_AND_PURCHASED",
        registered: true,
        purchased: true,
        purchasedWithoutRegistration: false,
        deliveryStatus: "Giao thành công",
      });
    }

    if (purchasedWithoutRegistration) {
      return NextResponse.json({
        success: true,
        status: "PURCHASED_WITHOUT_REGISTRATION",
        registered: false,
        purchased: true,
        purchasedWithoutRegistration: true,
        deliveryStatus: "Giao thành công",
      });
    }

    if (registered && !purchased) {
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
