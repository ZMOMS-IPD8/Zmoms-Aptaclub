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

const COMBO_CONFIG = {
  small: {
    name: "Combo nhỏ",
    price: 349000,
  },
  large: {
    name: "Combo lớn",
    price: 829000,
  },
} as const;

function getComboByAmount(amount: number) {
  if (amount === COMBO_CONFIG.small.price) {
    return COMBO_CONFIG.small;
  }

  if (amount === COMBO_CONFIG.large.price) {
    return COMBO_CONFIG.large;
  }

  return null;
}

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
  comboName: string,
  comboPrice: number,
) {
  const workspaceId = process.env.PANCAKE_WORKSPACE_ID;
  const apiKey = process.env.PANCAKE_CRM_API_KEY;

  if (!workspaceId || !apiKey) {
    throw new Error("Thiếu PANCAKE_WORKSPACE_ID hoặc PANCAKE_CRM_API_KEY.");
  }

  const updatePayload = {
    id: leadId,
    ma_don_hang: orderCode,
    trang_thai_thanh_toan: paymentStatus,
    ngay_dat_hang: paymentDate,
    ten_combo: comboName,
    gia_tien: String(comboPrice),
    ...(transactionId
      ? {
          ma_giao_dich_thanh_toan: transactionId,
        }
      : {}),
  };

  const updateUrl =
    `https://crm.pancake.vn/api/workspaces/` +
    `${workspaceId}/lead/records` +
    `?api_key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(updateUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatePayload),
    cache: "no-store",
  });

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
    const body = await req.json();

    const order = body?.data ?? body;

    if (!order || typeof order !== "object") {
      return NextResponse.json(
        {
          success: false,
          updated: false,
          message: "Payload webhook không hợp lệ.",
        },
        { status: 400 },
      );
    }

    const orderCode = String(order.id ?? "").trim();

    if (!orderCode || !/^ZMOMS-\d+$/.test(orderCode)) {
      return NextResponse.json({
        success: true,
        updated: false,
        orderCode: orderCode || null,
      });
    }

    const payment = getPaymentInfo(order);

    const comboInfo = getComboByAmount(payment.amountDue);

    if (
      payment.paymentStatus === "Chưa thanh toán" ||
      payment.paymentStatus === "Thanh toán thiếu"
    ) {
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

    if (!comboInfo) {
      return NextResponse.json(
        {
          success: false,
          updated: false,
          paid: true,
          orderCode,
          paymentStatus: payment.paymentStatus,
          amountDue: payment.amountDue,
          receivedAmount: payment.receivedAmount,
          message: "Không xác định được Combo từ giá trị đơn hàng.",
        },
        { status: 400 },
      );
    }

    const phone = String(order.bill_phone_number ?? "")
      .trim()
      .replace(/\D/g, "");

    if (!phone) {
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

    const member = await checkMemberByPhone(phone);

    if (!member.registered || !member.leadId) {
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

    const updateResult = await updateLeadPayment(
      member.leadId,
      orderCode,
      payment.paymentStatus,
      payment.paymentDate,
      payment.transactionId,
      comboInfo.name,
      comboInfo.price,
    );

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
      tenCombo: comboInfo.name,
      giaTien: comboInfo.price,
      crm: updateResult,
    });
  } catch (error) {
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
