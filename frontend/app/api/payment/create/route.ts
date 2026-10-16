import { NextRequest, NextResponse } from "next/server";
import { isValidPurchaseReferralCode } from "@/lib/referral-codes";
import { checkMemberByPhone } from "../../../lib/pancake/member";
import { createPancakeOrder } from "../../../lib/pancake/order";

const REFERRAL_DISCOUNT = 300000;

type ComboType = "small" | "large";

type CreateOrderBody = {
  phone: string;
  referralCode?: string;
  combo: ComboType;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateOrderBody;

    const phone = String(body.phone ?? "")
      .trim()
      .replace(/\D/g, "");

    const referralCode = String(body.referralCode ?? "")
      .trim()
      .toUpperCase();

    const combo = body.combo;

    if (!/^0\d{9}$/.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Số điện thoại không hợp lệ.",
        },
        { status: 400 },
      );
    }

    if (referralCode && !isValidPurchaseReferralCode(referralCode)) {
      return NextResponse.json(
        {
          success: false,
          message: "Mã giới thiệu không hợp lệ.",
        },
        { status: 400 },
      );
    }

    if (combo !== "small" && combo !== "large") {
      return NextResponse.json(
        {
          success: false,
          message: "Combo không hợp lệ.",
        },
        { status: 400 },
      );
    }

    const workspaceId = process.env.PANCAKE_WORKSPACE_ID;
    const apiKey = process.env.PANCAKE_CRM_API_KEY;

    if (!workspaceId || !apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Chưa cấu hình Pancake CRM API.",
        },
        { status: 500 },
      );
    }

    const member = await checkMemberByPhone(phone);

    if (!member.registered || !member.lead) {
      return NextResponse.json(
        {
          success: false,
          registered: false,
          message: "Số điện thoại chưa đăng ký hội viên.",
        },
        { status: 403 },
      );
    }

    const lead = member.lead;
    const leadId = member.leadId;

    const paymentStatus = String(lead.trang_thai_thanh_toan ?? "").trim();

    const existingOrderCode = String(lead.ma_don_hang ?? "").trim();

    if (paymentStatus === "Đã thanh toán") {
      return NextResponse.json(
        {
          success: false,
          alreadyPurchased: true,
          paymentStatus,
          orderCode: existingOrderCode || null,
          message:
            "Số điện thoại này đã thanh toán đơn hàng. Mẹ vui lòng nhắn tin qua Zalo OA để biết tình trạng đơn hàng.",
        },
        { status: 409 },
      );
    }

    const discountAmount = referralCode ? REFERRAL_DISCOUNT : 0;

    const orderCode = `ZMOMS-${Date.now()}`;

    const fullName = String(lead.name ?? "").trim() || "Khách hàng ZMOMS";

    const pancakeOrder = await createPancakeOrder({
      combo,
      phone,
      fullName,
      orderCode,
      discountAmount,
    });

    const updatePayload: Record<string, string> = {
      id: leadId,
      trang_thai_thanh_toan: "Chưa thanh toán",
      ma_don_hang: orderCode,
    };

    const updateUrl =
      `https://crm.pancake.vn/api/workspaces/` +
      `${workspaceId}/lead/records` +
      `?api_key=${encodeURIComponent(apiKey)}`;

    const updateResponse = await fetch(updateUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatePayload),
      cache: "no-store",
    });

    let updateResult: {
      message?: string;
      error?: string;
    } = {};

    try {
      updateResult = await updateResponse.json();
    } catch {
      updateResult = {};
    }

    if (!updateResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          orderCreated: true,
          orderCode,
          trackingLink: pancakeOrder.trackingLink,
          message:
            updateResult.message ||
            updateResult.error ||
            "Đã tạo đơn hàng nhưng không thể cập nhật trạng thái thanh toán trên Pancake CRM.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      orderCode,
      phone,
      referralCode,
      combo,
      originalAmount: pancakeOrder.originalAmount,
      discountAmount: pancakeOrder.discountAmount,
      amount: pancakeOrder.amount,
      paymentReference: pancakeOrder.paymentReference,
      paymentStatus: "Chưa thanh toán",
      payment: pancakeOrder.payment,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Không thể tạo đơn hàng.",
      },
      { status: 500 },
    );
  }
}
