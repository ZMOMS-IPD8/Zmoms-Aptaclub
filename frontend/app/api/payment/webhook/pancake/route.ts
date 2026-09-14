import { NextRequest, NextResponse } from "next/server";

type PancakePaymentHistory = {
  amount?: number | string;
  result_code?: string | number;
  ipn_reply?: boolean;
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
  custom_id?: string;
  bill_phone_number?: string;
  updated_at?: string;
  created_at?: string;
  cod?: number | string;
  transfer_money?: number | string;
  payment_purchase_histories?: PancakePaymentHistory[];
  transfer_proofs?: PancakeTransferProof[];
};

type PancakeWebhookPayload = {
  order?: PancakeOrder;
  data?: PancakeOrder | { order?: PancakeOrder };
  orders?: PancakeOrder[];
};

type PaymentStatus = "Chưa thanh toán" | "Thanh toán thiếu" | "Đã thanh toán";

function getOrder(payload: PancakeWebhookPayload): PancakeOrder | null {
  if (payload.order) {
    return payload.order;
  }

  if (payload.data) {
    if ("custom_id" in payload.data) {
      return payload.data;
    }

    if ("order" in payload.data && payload.data.order) {
      return payload.data.order;
    }
  }

  if (Array.isArray(payload.orders) && payload.orders.length > 0) {
    return payload.orders[0];
  }

  return null;
}

function getAmount(value: unknown): number {
  const amount = Number(value ?? 0);

  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
}

function getSuccessfulHistory(
  histories: PancakePaymentHistory[],
): PancakePaymentHistory | null {
  return (
    [...histories].reverse().find((payment) => {
      const amount = getAmount(payment.amount);

      if (amount <= 0) {
        return false;
      }

      if (
        payment.result_code !== undefined &&
        payment.result_code !== null &&
        String(payment.result_code) !== "00"
      ) {
        return false;
      }

      if (payment.ipn_reply === false) {
        return false;
      }

      return true;
    }) ?? null
  );
}

function getVerifiedTransfer(
  transferProofs: PancakeTransferProof[],
): PancakeTransferProof | null {
  return (
    [...transferProofs].reverse().find((proof) => {
      const amount = getAmount(proof.amount);

      return (
        amount > 0 && proof.is_income !== false && proof.is_verify === true
      );
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

  const amountDue = getAmount(order.cod);
  const transferMoney = getAmount(order.transfer_money);

  const successfulHistory = getSuccessfulHistory(histories);
  const verifiedTransfer = getVerifiedTransfer(transferProofs);

  const historyAmount = getAmount(successfulHistory?.amount);
  const proofAmount = getAmount(verifiedTransfer?.amount);

  const receivedAmount =
    transferMoney > 0
      ? transferMoney
      : historyAmount > 0
        ? historyAmount
        : proofAmount;

  let paymentStatus: PaymentStatus;

  if (receivedAmount <= 0) {
    paymentStatus = "Chưa thanh toán";
  } else if (amountDue > 0 && receivedAmount < amountDue) {
    paymentStatus = "Thanh toán thiếu";
  } else {
    paymentStatus = "Đã thanh toán";
  }

  const paymentDate =
    successfulHistory?.created_at ??
    successfulHistory?.updated_at ??
    verifiedTransfer?.created_at ??
    verifiedTransfer?.updated_at ??
    order.updated_at ??
    order.created_at ??
    new Date().toISOString();

  const transactionId =
    successfulHistory?.transaction_id ??
    successfulHistory?.payment_id ??
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
  };
}

async function findLeadByPhone(phone: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.VERCEL_URL ||
    "";

  const url = baseUrl.startsWith("http")
    ? `${baseUrl}/api/member/check`
    : `http://localhost:${process.env.PORT || 3000}/api/member/check`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  if (!data?.success || !data?.registered || !data?.leadId) {
    return null;
  }

  return {
    leadId: data.leadId,
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

  if (!workspaceId || !apiKey) {
    throw new Error("Thiếu PANCAKE_WORKSPACE_ID hoặc PANCAKE_CRM_API_KEY.");
  }

  const response = await fetch(
    `https://pos.pages.fm/api/v1/workspaces/${workspaceId}/leads?api_key=${encodeURIComponent(apiKey)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: leadId,
        ma_don_hang: orderCode,
        trang_thai_thanh_toan: paymentStatus,
        ngay_dat_hang: paymentDate,
        ...(transactionId
          ? {
              ma_giao_dich_thanh_toan: transactionId,
            }
          : {}),
      }),
      cache: "no-store",
    },
  );

  const data = await response.json().catch(() => null);

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
  try {
    const payload = (await req.json()) as PancakeWebhookPayload;

    const order = getOrder(payload);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy Order trong webhook.",
        },
        { status: 400 },
      );
    }

    const orderCode = String(order.custom_id ?? "").trim();

    if (!orderCode || !/^ZMOMS-\d+$/.test(orderCode)) {
      return NextResponse.json({
        success: true,
        updated: false,
        message: "Webhook không chứa mã đơn ZMOMS hợp lệ.",
      });
    }

    const payment = getPaymentInfo(order);

    if (payment.paymentStatus === "Chưa thanh toán") {
      return NextResponse.json({
        success: true,
        updated: false,
        paid: false,
        orderCode,
        paymentStatus: "Chưa thanh toán",
        amountDue: payment.amountDue,
        receivedAmount: payment.receivedAmount,
      });
    }

    const phone = String(order.bill_phone_number ?? "")
      .trim()
      .replace(/\D/g, "");

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          updated: false,
          paid: payment.paymentStatus === "Đã thanh toán",
          orderCode,
          paymentStatus: payment.paymentStatus,
          amountDue: payment.amountDue,
          receivedAmount: payment.receivedAmount,
          message: "Đã nhận thông tin thanh toán nhưng không có số điện thoại.",
        },
        { status: 400 },
      );
    }

    const member = await findLeadByPhone(phone);

    if (!member) {
      return NextResponse.json(
        {
          success: false,
          updated: false,
          paid: payment.paymentStatus === "Đã thanh toán",
          orderCode,
          paymentStatus: payment.paymentStatus,
          amountDue: payment.amountDue,
          receivedAmount: payment.receivedAmount,
          message:
            "Đã nhận thông tin thanh toán nhưng không tìm thấy Lead tương ứng.",
        },
        { status: 404 },
      );
    }

    await updateLeadPayment(
      member.leadId,
      orderCode,
      payment.paymentStatus,
      payment.paymentDate,
      payment.transactionId,
    );

    return NextResponse.json({
      success: true,
      updated: true,
      paid: payment.paymentStatus === "Đã thanh toán",
      orderCode,
      paymentStatus: payment.paymentStatus,
      amountDue: payment.amountDue,
      receivedAmount: payment.receivedAmount,
      paymentDate: payment.paymentDate,
      transactionId: payment.transactionId || null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        updated: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể xử lý webhook thanh toán.",
      },
      { status: 500 },
    );
  }
}
