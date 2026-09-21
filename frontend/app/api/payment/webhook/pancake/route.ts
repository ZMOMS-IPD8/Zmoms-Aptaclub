import { NextRequest, NextResponse } from "next/server";
import { checkMemberByPhone } from "../../../../lib/pancake/member";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PaymentHistory = {
  amount?: number | string;
  inserted_at?: string;
  ipn_reply?: boolean | string | number;
  result_code?: string | number;
  payment_id?: string | number;
  transaction_id?: string | number;
  type?: string;
  date?: string;
};

type TransferProof = {
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
  bill_phone_number?: string;
  bill_full_name?: string;

  money_to_collect?: number | string;
  transfer_money?: number | string;
  total_price?: number | string;
  total_discount?: number | string;

  prepaid?: number | string;
  cash?: number | string;
  cod?: number | string;

  payment_purchase_histories?: PaymentHistory[];
  transfer_proofs?: TransferProof[];

  inserted_at?: string;
  updated_at?: string;
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

function toNumber(value: unknown): number {
  const number = Number(value ?? 0);

  return Number.isFinite(number) && number >= 0 ? number : 0;
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

function getExpectedAmount(order: PancakeOrder): number {
  const moneyToCollect = toNumber(order.money_to_collect);

  if (moneyToCollect > 0) {
    return moneyToCollect;
  }

  const totalPrice = toNumber(order.total_price);
  const totalDiscount = toNumber(order.total_discount);

  if (totalPrice > 0) {
    return Math.max(totalPrice - totalDiscount, 0);
  }

  return 0;
}

function getCombo(order: PancakeOrder) {
  const expectedAmount = getExpectedAmount(order);

  if (expectedAmount === COMBO_CONFIG.small.price) {
    return COMBO_CONFIG.small;
  }

  if (expectedAmount === COMBO_CONFIG.large.price) {
    return COMBO_CONFIG.large;
  }

  return null;
}

function getPaymentHistory(order: PancakeOrder): PaymentHistory | null {
  const histories = Array.isArray(order.payment_purchase_histories)
    ? order.payment_purchase_histories
    : [];

  return (
    [...histories].reverse().find((payment) => {
      const amount = toNumber(payment.amount);

      const resultCode = String(payment.result_code ?? "").trim();

      const ipnConfirmed = isTrue(payment.ipn_reply);

      return amount > 0 && (resultCode === "0" || ipnConfirmed);
    }) ?? null
  );
}

function getTransferProof(order: PancakeOrder): TransferProof | null {
  const proofs = Array.isArray(order.transfer_proofs)
    ? order.transfer_proofs
    : [];

  return (
    [...proofs].reverse().find((proof) => {
      const amount = toNumber(proof.amount);

      return amount > 0 && proof.is_income === true && proof.is_verify === true;
    }) ?? null
  );
}

function getPaymentInfo(order: PancakeOrder) {
  const expectedAmount = getExpectedAmount(order);

  const history = getPaymentHistory(order);
  const transferProof = getTransferProof(order);

  const historyAmount = toNumber(history?.amount);
  const transferAmount = toNumber(transferProof?.amount);
  const transferMoney = toNumber(order.transfer_money);

  const receivedAmount =
    historyAmount > 0
      ? historyAmount
      : transferAmount > 0
        ? transferAmount
        : transferMoney;

  let paymentStatus: PaymentStatus = "Chưa thanh toán";

  if (receivedAmount > 0) {
    if (expectedAmount > 0 && receivedAmount < expectedAmount) {
      paymentStatus = "Thanh toán thiếu";
    } else {
      paymentStatus = "Đã thanh toán";
    }
  }

  const paymentDate =
    history?.date ??
    history?.inserted_at ??
    transferProof?.created_at ??
    transferProof?.updated_at ??
    order.updated_at ??
    order.inserted_at ??
    new Date().toISOString();

  const transactionId =
    history?.transaction_id ??
    history?.payment_id ??
    transferProof?.transaction_id ??
    transferProof?.payment_id;

  return {
    expectedAmount,
    receivedAmount,
    paymentStatus,
    paymentDate,
    transactionId: transactionId !== undefined ? String(transactionId) : "",
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
    `https://crm.pancake.vn/api/workspaces/${workspaceId}/lead/records` +
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

    if (!orderCode) {
      return NextResponse.json({
        success: true,
        updated: false,
        message: "Webhook không có Order ID.",
      });
    }

    const payment = getPaymentInfo(order);

    if (payment.paymentStatus !== "Đã thanh toán") {
      return NextResponse.json({
        success: true,
        updated: false,
        paid: false,
        orderCode,
        paymentStatus: payment.paymentStatus,
        amountDue: payment.expectedAmount,
        receivedAmount: payment.receivedAmount,
      });
    }

    const combo = getCombo(order);

    if (!combo) {
      return NextResponse.json(
        {
          success: false,
          updated: false,
          paid: true,
          orderCode,
          paymentStatus: payment.paymentStatus,
          amountDue: payment.expectedAmount,
          receivedAmount: payment.receivedAmount,
          message: "Không xác định được Combo từ Order.",
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
          amountDue: payment.expectedAmount,
          receivedAmount: payment.receivedAmount,
          message: "Order không có bill_phone_number.",
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
          phone,
          message: "Không tìm thấy Lead tương ứng.",
        },
        { status: 404 },
      );
    }

    const crm = await updateLeadPayment(
      member.leadId,
      orderCode,
      payment.paymentStatus,
      payment.paymentDate,
      payment.transactionId,
      combo.name,
      combo.price,
    );

    return NextResponse.json({
      success: true,
      updated: true,
      paid: true,
      orderCode,
      paymentStatus: payment.paymentStatus,
      amountDue: payment.expectedAmount,
      receivedAmount: payment.receivedAmount,
      paymentDate: payment.paymentDate,
      transactionId: payment.transactionId || null,
      leadId: member.leadId,
      phone,
      tenCombo: combo.name,
      giaTien: combo.price,
      crm,
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

export async function GET() {
  return NextResponse.json({
    success: true,
    webhook: true,
  });
}
