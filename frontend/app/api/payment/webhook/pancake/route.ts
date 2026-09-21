import { NextRequest, NextResponse } from "next/server";
import { checkMemberByPhone } from "../../../../lib/pancake/member";

type PancakePaymentHistory = {
  type?: string;
  amount?: number | string;
  result_code?: string | number;
  ipn_reply?: boolean | string | number;
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

  amount?: number | string;
  amount_due?: number | string;
  amountDue?: number | string;

  payment_status?: string;
  paymentStatus?: string;
  status_payment?: string;

  payment_date?: string;
  paymentDate?: string;

  result_code?: string | number;
  ipn_reply?: boolean | string | number;

  transaction_id?: string | number;
  payment_id?: string | number;

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

function getAmount(value: unknown): number {
  const amount = Number(value ?? 0);

  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
}

function isTrue(value: unknown): boolean {
  return (
    value === true ||
    value === 1 ||
    String(value ?? "")
      .trim()
      .toLowerCase() === "true"
  );
}

function getComboByAmount(amount: number) {
  if (amount === COMBO_CONFIG.small.price) {
    return COMBO_CONFIG.small;
  }

  if (amount === COMBO_CONFIG.large.price) {
    return COMBO_CONFIG.large;
  }

  return null;
}

function getSuccessfulPayment(
  histories: PancakePaymentHistory[],
): PancakePaymentHistory | null {
  return (
    [...histories].reverse().find((payment) => {
      const amount = getAmount(payment.amount);
      const resultCode = String(payment.result_code ?? "").trim();

      return amount > 0 && resultCode === "0" && isTrue(payment.ipn_reply);
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

function getDirectPaymentAmount(order: PancakeOrder): number {
  const candidates = [
    order.amount,
    order.amount_due,
    order.amountDue,
    order.transfer_money,
    order.prepaid,
    order.money_to_collect,
  ];

  for (const value of candidates) {
    const amount = getAmount(value);

    if (amount > 0) {
      return amount;
    }
  }

  return 0;
}

function getPaymentInfo(order: PancakeOrder) {
  const histories = Array.isArray(order.payment_purchase_histories)
    ? order.payment_purchase_histories
    : [];

  const transferProofs = Array.isArray(order.transfer_proofs)
    ? order.transfer_proofs
    : [];

  const amountDueCandidates = [
    order.money_to_collect,
    order.amount_due,
    order.amountDue,
    order.total_price_after_sub_discount,
  ];

  let amountDue = 0;

  for (const value of amountDueCandidates) {
    const amount = getAmount(value);

    if (amount > 0) {
      amountDue = amount;
      break;
    }
  }

  const successfulPayment = getSuccessfulPayment(histories);
  const verifiedTransfer = getVerifiedTransfer(transferProofs);

  const historyPaymentAmount = getAmount(successfulPayment?.amount);

  const transferProofAmount = getAmount(verifiedTransfer?.amount);

  const directPaymentAmount = getDirectPaymentAmount(order);

  const receivedAmount =
    historyPaymentAmount > 0
      ? historyPaymentAmount
      : transferProofAmount > 0
        ? transferProofAmount
        : directPaymentAmount;

  const directPaymentStatus = String(
    order.payment_status ?? order.paymentStatus ?? order.status_payment ?? "",
  )
    .trim()
    .toLowerCase();

  const directResultCode = String(order.result_code ?? "").trim();

  const directIpnConfirmed = isTrue(order.ipn_reply);

  const directPaymentConfirmed =
    directResultCode === "0" && directIpnConfirmed && receivedAmount > 0;

  const directStatusConfirmed =
    directPaymentStatus === "đã thanh toán" ||
    directPaymentStatus === "paid" ||
    directPaymentStatus === "success" ||
    directPaymentStatus === "completed";

  let paymentStatus: PaymentStatus;

  if (
    successfulPayment ||
    verifiedTransfer ||
    directPaymentConfirmed ||
    directStatusConfirmed
  ) {
    if (amountDue > 0 && receivedAmount > 0 && receivedAmount < amountDue) {
      paymentStatus = "Thanh toán thiếu";
    } else {
      paymentStatus = "Đã thanh toán";
    }
  } else {
    paymentStatus = "Chưa thanh toán";
  }

  const paymentDate =
    successfulPayment?.date ??
    successfulPayment?.inserted_at ??
    successfulPayment?.created_at ??
    successfulPayment?.updated_at ??
    verifiedTransfer?.created_at ??
    verifiedTransfer?.updated_at ??
    order.payment_date ??
    order.paymentDate ??
    order.updated_at ??
    order.inserted_at ??
    new Date().toISOString();

  const transactionId =
    successfulPayment?.transaction_id ??
    successfulPayment?.payment_id ??
    verifiedTransfer?.transaction_id ??
    verifiedTransfer?.payment_id ??
    order.transaction_id ??
    order.payment_id;

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

function getComboFromOrder(order: PancakeOrder, amountDue: number) {
  const directCombo = getComboByAmount(amountDue);

  if (directCombo) {
    return directCombo;
  }

  const amounts = [
    order.amount,
    order.amount_due,
    order.amountDue,
    order.money_to_collect,
    order.total_price_after_sub_discount,
    order.transfer_money,
    order.prepaid,
  ];

  for (const value of amounts) {
    const combo = getComboByAmount(getAmount(value));

    if (combo) {
      return combo;
    }
  }

  return null;
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

    if (
      payment.paymentStatus === "Chưa thanh toán" ||
      payment.paymentStatus === "Thanh toán thiếu"
    ) {
      return NextResponse.json({
        success: true,
        updated: false,
        paid: false,
        orderCode,
        paymentStatus: payment.paymentStatus,
        amountDue: payment.amountDue,
        receivedAmount: payment.receivedAmount,
      });
    }

    const comboInfo = getComboFromOrder(order, payment.amountDue);

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
          message: "Đã xác nhận thanh toán nhưng không xác định được Combo.",
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
