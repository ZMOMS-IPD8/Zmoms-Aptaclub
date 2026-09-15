import { NextRequest, NextResponse } from "next/server";
import { checkMemberByPhone } from "../../../../lib/pancake/member";

type PancakePaymentHistory = {
  type?: string;
  amount?: number | string;
  result_code?: string | number;
  ipn_reply?: boolean;
  date?: string;
  inserted_at?: string;
  created_at?: string;
  updated_at?: string;
  payment_id?: string | number;
  transaction_id?: string | number;
};

type PancakeTransferProof = {
  amount?: number | string;
  is_income?: boolean;
  is_verify?: boolean;
  payment_id?: string | number;
  transaction_id?: string | number;
  created_at?: string;
  updated_at?: string;
};

type PancakeOrder = {
  id?: string | number;
  type?: string;
  event_type?: string;

  bill_phone_number?: string;
  bill_full_name?: string;

  inserted_at?: string;
  updated_at?: string;

  total_price?: number | string;
  total_price_after_sub_discount?: number | string;
  money_to_collect?: number | string;
  prepaid?: number | string;
  transfer_money?: number | string;

  cash?: number | string;
  cod?: number | string;

  charged_by_card?: number | string;
  charged_by_fundiin?: number | string;
  charged_by_kredivo?: number | string;
  charged_by_momo?: number | string;
  charged_by_qrpay?: number | string;
  charged_by_vnpay?: number | string;

  payment_purchase_histories?: PancakePaymentHistory[];
  transfer_proofs?: PancakeTransferProof[];
};

type PaymentStatus = "Chưa thanh toán" | "Thanh toán thiếu" | "Đã thanh toán";

function getAmount(value: unknown): number {
  const amount = Number(value ?? 0);

  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
}

function getSuccessfulPayment(
  histories: PancakePaymentHistory[],
): PancakePaymentHistory | null {
  return (
    [...histories].reverse().find((payment) => {
      const amount = getAmount(payment.amount);

      return (
        amount > 0 &&
        String(payment.result_code ?? "") === "0" &&
        payment.ipn_reply === true
      );
    }) ?? null
  );
}

function getVerifiedTransfer(
  transferProofs: PancakeTransferProof[],
): PancakeTransferProof | null {
  return (
    [...transferProofs].reverse().find((proof) => {
      const amount = getAmount(proof.amount);

      return amount > 0 && proof.is_income === true && proof.is_verify === true;
    }) ?? null
  );
}

function getPaymentInfo(order: PancakeOrder) {
  const histories = Array.isArray(order.payment_purchase_histories)
    ? order.payment_purchase_histories
    : [];

  const transferProofs = Array.isArray(order.transfer_proofs)
    ? order.transfer_proofs
    : [];

  const amountDue = getAmount(order.money_to_collect);

  const successfulPayment = getSuccessfulPayment(histories);
  const verifiedTransfer = getVerifiedTransfer(transferProofs);

  const paymentAmount = getAmount(successfulPayment?.amount);
  const proofAmount = getAmount(verifiedTransfer?.amount);

  const receivedAmount = paymentAmount > 0 ? paymentAmount : proofAmount;

  let paymentStatus: PaymentStatus;

  if (!successfulPayment && !verifiedTransfer) {
    paymentStatus = "Chưa thanh toán";
  } else if (amountDue > 0 && receivedAmount < amountDue) {
    paymentStatus = "Thanh toán thiếu";
  } else {
    paymentStatus = "Đã thanh toán";
  }

  const paymentDate =
    successfulPayment?.date ??
    successfulPayment?.inserted_at ??
    successfulPayment?.created_at ??
    successfulPayment?.updated_at ??
    verifiedTransfer?.created_at ??
    verifiedTransfer?.updated_at ??
    order.updated_at ??
    order.inserted_at ??
    new Date().toISOString();

  const transactionId =
    successfulPayment?.transaction_id ??
    successfulPayment?.payment_id ??
    verifiedTransfer?.transaction_id ??
    verifiedTransfer?.payment_id;

  return {
    amountDue,
    receivedAmount,
    paymentStatus,
    paymentDate,
    transactionId:
      transactionId !== undefined && transactionId !== null
        ? String(transactionId)
        : "",
    successfulPayment,
    verifiedTransfer,
  };
}

async function updateLeadPayment(
  leadId: string,
  orderCode: string,
  paymentStatus: PaymentStatus,
  paymentDate: string,
  transactionId: string,
) {
  const workspaceId = process.env.PANCAKE_WORKSPACE_ID;
  const apiKey = process.env.PANCAKE_CRM_API_KEY;

  console.log("[WEBHOOK] UPDATE LEAD");
  console.log("[WEBHOOK] Lead ID:", leadId);
  console.log("[WEBHOOK] Order code:", orderCode);
  console.log("[WEBHOOK] Payment status:", paymentStatus);
  console.log("[WEBHOOK] Payment date:", paymentDate);
  console.log("[WEBHOOK] Transaction ID:", transactionId || null);

  if (!workspaceId || !apiKey) {
    throw new Error("Thiếu PANCAKE_WORKSPACE_ID hoặc PANCAKE_CRM_API_KEY.");
  }

  const updatePayload = {
    id: leadId,
    ma_don_hang: orderCode,
    trang_thai_thanh_toan: paymentStatus,
    ngay_dat_hang: paymentDate,
    ...(transactionId
      ? {
          ma_giao_dich_thanh_toan: transactionId,
        }
      : {}),
  };

  console.log(
    "[WEBHOOK] CRM update payload:",
    JSON.stringify(updatePayload, null, 2),
  );

  const response = await fetch(
    `https://pos.pages.fm/api/v1/workspaces/${workspaceId}/leads?api_key=${encodeURIComponent(apiKey)}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatePayload),
      cache: "no-store",
    },
  );

  console.log("[WEBHOOK] CRM update status:", response.status);

  const data = await response.json().catch(() => null);

  console.log("[WEBHOOK] CRM update response:", JSON.stringify(data, null, 2));

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        "Không thể cập nhật trạng thái thanh toán CRM.",
    );
  }

  return data;
}

export async function POST(req: NextRequest) {
  console.log("========== PANCAKE WEBHOOK START ==========");

  try {
    const body = await req.json();

    console.log("[WEBHOOK] Raw payload:");
    console.log(JSON.stringify(body, null, 2));

    const order = body?.data ?? body;

    if (!order || typeof order !== "object") {
      console.log("[WEBHOOK] ERROR: Payload không phải Order object");

      return NextResponse.json(
        {
          success: false,
          updated: false,
          message: "Payload webhook không hợp lệ.",
        },
        { status: 400 },
      );
    }

    console.log("[WEBHOOK] Event type:", order.event_type ?? null);
    console.log("[WEBHOOK] Order type:", order.type ?? null);
    console.log("[WEBHOOK] Order ID:", order.id ?? null);

    const orderCode = String(order.id ?? "").trim();

    if (!orderCode || !/^ZMOMS-\d+$/.test(orderCode)) {
      console.log("[WEBHOOK] Order code không hợp lệ:", orderCode || null);

      return NextResponse.json({
        success: true,
        updated: false,
        orderCode: orderCode || null,
      });
    }

    console.log("[WEBHOOK] Order code hợp lệ:", orderCode);
    console.log("[WEBHOOK] Bill phone:", order.bill_phone_number ?? null);
    console.log("[WEBHOOK] Bill name:", order.bill_full_name ?? null);
    console.log("[WEBHOOK] Money to collect:", order.money_to_collect ?? null);
    console.log("[WEBHOOK] Prepaid:", order.prepaid ?? null);
    console.log("[WEBHOOK] Transfer money:", order.transfer_money ?? null);
    console.log("[WEBHOOK] Status:", order.status ?? null);
    console.log("[WEBHOOK] Status name:", order.status_name ?? null);

    console.log(
      "[WEBHOOK] Payment purchase histories:",
      JSON.stringify(order.payment_purchase_histories ?? [], null, 2),
    );

    console.log(
      "[WEBHOOK] Transfer proofs:",
      JSON.stringify(order.transfer_proofs ?? [], null, 2),
    );

    const payment = getPaymentInfo(order);

    console.log("[WEBHOOK] PAYMENT INFO");
    console.log("[WEBHOOK] Amount due:", payment.amountDue);
    console.log("[WEBHOOK] Received amount:", payment.receivedAmount);
    console.log("[WEBHOOK] Payment status:", payment.paymentStatus);
    console.log("[WEBHOOK] Payment date:", payment.paymentDate);
    console.log("[WEBHOOK] Transaction ID:", payment.transactionId || null);

    console.log(
      "[WEBHOOK] Successful payment:",
      JSON.stringify(payment.successfulPayment, null, 2),
    );

    console.log(
      "[WEBHOOK] Verified transfer:",
      JSON.stringify(payment.verifiedTransfer, null, 2),
    );

    if (payment.paymentStatus === "Chưa thanh toán") {
      console.log("[WEBHOOK] KẾT QUẢ: CHƯA THANH TOÁN - KHÔNG UPDATE CRM");

      return NextResponse.json({
        success: true,
        updated: false,
        paid: false,
        eventType: order.event_type ?? null,
        orderCode,
        paymentStatus: payment.paymentStatus,
        amountDue: payment.amountDue,
        receivedAmount: payment.receivedAmount,
      });
    }

    if (payment.paymentStatus === "Thanh toán thiếu") {
      console.log("[WEBHOOK] KẾT QUẢ: THANH TOÁN THIẾU - KHÔNG UPDATE CRM");

      return NextResponse.json({
        success: true,
        updated: false,
        paid: false,
        eventType: order.event_type ?? null,
        orderCode,
        paymentStatus: payment.paymentStatus,
        amountDue: payment.amountDue,
        receivedAmount: payment.receivedAmount,
      });
    }

    console.log("[WEBHOOK] KẾT QUẢ: ĐÃ THANH TOÁN - TIẾP TỤC UPDATE CRM");

    const phone = String(order.bill_phone_number ?? "")
      .trim()
      .replace(/\D/g, "");

    console.log("[WEBHOOK] Normalized phone:", phone);

    if (!phone) {
      console.log(
        "[WEBHOOK] ERROR: Đã thanh toán nhưng không có số điện thoại",
      );

      return NextResponse.json(
        {
          success: false,
          updated: false,
          paid: true,
          eventType: order.event_type ?? null,
          orderCode,
          paymentStatus: payment.paymentStatus,
          amountDue: payment.amountDue,
          receivedAmount: payment.receivedAmount,
          message:
            "Đã xác nhận thanh toán nhưng không có số điện thoại khách hàng.",
        },
        { status: 400 },
      );
    }

    console.log("[WEBHOOK] CHECK MEMBER BY PHONE");

    const member = await checkMemberByPhone(phone);

    console.log(
      "[WEBHOOK] Member result:",
      JSON.stringify(
        {
          registered: member.registered,
          leadId: member.leadId,
          phone: member.phone,
          fullName: member.fullName,
        },
        null,
        2,
      ),
    );

    if (!member.registered || !member.leadId) {
      console.log("[WEBHOOK] ERROR: Không tìm thấy Lead tương ứng");

      return NextResponse.json(
        {
          success: false,
          updated: false,
          paid: true,
          eventType: order.event_type ?? null,
          orderCode,
          paymentStatus: payment.paymentStatus,
          amountDue: payment.amountDue,
          receivedAmount: payment.receivedAmount,
          phone,
          message:
            "Đã xác nhận thanh toán nhưng không tìm thấy Lead tương ứng.",
        },
        { status: 404 },
      );
    }

    console.log("[WEBHOOK] Lead ID tìm được:", member.leadId);

    const updateResult = await updateLeadPayment(
      member.leadId,
      orderCode,
      payment.paymentStatus,
      payment.paymentDate,
      payment.transactionId,
    );

    console.log("[WEBHOOK] UPDATE CRM THÀNH CÔNG");

    console.log("[WEBHOOK] CRM result:", JSON.stringify(updateResult, null, 2));

    console.log("========== PANCAKE WEBHOOK SUCCESS ==========");

    return NextResponse.json({
      success: true,
      updated: true,
      paid: true,
      eventType: order.event_type ?? null,
      orderCode,
      paymentStatus: payment.paymentStatus,
      amountDue: payment.amountDue,
      receivedAmount: payment.receivedAmount,
      paymentDate: payment.paymentDate,
      transactionId: payment.transactionId || null,
      leadId: member.leadId,
      phone,
    });
  } catch (error) {
    console.log("========== PANCAKE WEBHOOK ERROR ==========");

    console.log(
      "[WEBHOOK] Error:",
      error instanceof Error ? error.message : error,
    );

    return NextResponse.json(
      {
        success: false,
        updated: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể xử lý webhook đơn hàng.",
      },
      { status: 500 },
    );
  }
}
