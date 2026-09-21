import { NextRequest, NextResponse } from "next/server";
import { checkMemberByPhone } from "../../../../lib/pancake/member";
import { PANCAKE_POS_CONFIG } from "../../../../lib/pancake/pos";

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

type PancakeItem = {
  quantity?: number;
  product_id?: string;
  variation_id?: string;
  variation_info?: {
    name?: string;
    id?: string;
    retail_price?: number | string;
  };
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

  items?: PancakeItem[];

  inserted_at?: string;
  updated_at?: string;
};

type PaymentStatus = "Chưa thanh toán" | "Thanh toán thiếu" | "Đã thanh toán";

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
  const items = Array.isArray(order.items) ? order.items : [];

  for (const item of items) {
    const variationId = String(item.variation_id ?? "").trim();
    const productId = String(item.product_id ?? "").trim();

    if (variationId && variationId === PANCAKE_POS_CONFIG.small.variationId) {
      return PANCAKE_POS_CONFIG.small;
    }

    if (variationId && variationId === PANCAKE_POS_CONFIG.large.variationId) {
      return PANCAKE_POS_CONFIG.large;
    }

    if (productId && productId === PANCAKE_POS_CONFIG.small.productId) {
      return PANCAKE_POS_CONFIG.small;
    }

    if (productId && productId === PANCAKE_POS_CONFIG.large.productId) {
      return PANCAKE_POS_CONFIG.large;
    }

    const variationName = String(item.variation_info?.name ?? "")
      .trim()
      .toLowerCase();

    if (variationName === "combo nhỏ") {
      return PANCAKE_POS_CONFIG.small;
    }

    if (variationName === "combo lớn") {
      return PANCAKE_POS_CONFIG.large;
    }
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

  console.log("[WEBHOOK] CRM update start", {
    leadId,
    orderCode,
    paymentStatus,
    paymentDate,
    transactionId,
    comboName,
    comboPrice,
    hasWorkspaceId: Boolean(workspaceId),
    hasApiKey: Boolean(apiKey),
  });

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

  console.log("[WEBHOOK] CRM payload", updatePayload);

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

  console.log("[WEBHOOK] CRM response", {
    status: response.status,
    ok: response.ok,
    data,
  });

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
  console.log("[WEBHOOK] ===== PAYMENT WEBHOOK START =====");

  try {
    const body = await req.json();

    console.log("[WEBHOOK] Payload received", body);

    const order = body?.data ?? body;

    console.log("[WEBHOOK] Order extracted", {
      hasDataWrapper: Boolean(body?.data),
      orderId: order?.id ?? null,
      phone: order?.bill_phone_number ?? null,
      moneyToCollect: order?.money_to_collect ?? null,
      transferMoney: order?.transfer_money ?? null,
      totalPrice: order?.total_price ?? null,
      totalDiscount: order?.total_discount ?? null,
      items: Array.isArray(order?.items)
        ? order.items.map((item: PancakeItem) => ({
            productId: item.product_id ?? null,
            variationId: item.variation_id ?? null,
            variationName: item.variation_info?.name ?? null,
          }))
        : [],
    });

    if (!order || typeof order !== "object") {
      console.log("[WEBHOOK] ERROR: Invalid payload");

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

    console.log("[WEBHOOK] Order ID:", orderCode);

    if (!orderCode) {
      console.log("[WEBHOOK] STOP: Missing Order ID");

      return NextResponse.json({
        success: true,
        updated: false,
        message: "Webhook không có Order ID.",
      });
    }

    const payment = getPaymentInfo(order);

    console.log("[WEBHOOK] Payment info", payment);

    if (payment.paymentStatus !== "Đã thanh toán") {
      console.log("[WEBHOOK] STOP: Payment not completed", {
        orderCode,
        paymentStatus: payment.paymentStatus,
        amountDue: payment.expectedAmount,
        receivedAmount: payment.receivedAmount,
      });

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

    console.log("[WEBHOOK] PAYMENT CONFIRMED", {
      orderCode,
      amountDue: payment.expectedAmount,
      receivedAmount: payment.receivedAmount,
    });

    const combo = getCombo(order);

    console.log("[WEBHOOK] Combo detected", combo);

    if (!combo) {
      console.log("[WEBHOOK] ERROR: Cannot detect combo");

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

    console.log("[WEBHOOK] Customer", {
      fullName: order.bill_full_name ?? null,
      phone,
    });

    if (!phone) {
      console.log("[WEBHOOK] ERROR: Missing phone");

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

    console.log("[WEBHOOK] Checking member by phone:", phone);

    const member = await checkMemberByPhone(phone);

    console.log("[WEBHOOK] Member result", {
      registered: member.registered,
      leadId: member.leadId ?? null,
      fullName: member.fullName ?? null,
    });

    if (!member.registered || !member.leadId) {
      console.log("[WEBHOOK] ERROR: Lead not found");

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

    console.log("[WEBHOOK] SUCCESS: CRM updated", {
      orderCode,
      leadId: member.leadId,
      paymentStatus: payment.paymentStatus,
      combo: combo.name,
      amount: combo.price,
    });

    console.log("[WEBHOOK] ===== PAYMENT WEBHOOK END =====");

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
    console.error("[WEBHOOK] ERROR:", error);

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
  console.log("[WEBHOOK] GET health check");

  return NextResponse.json({
    success: true,
    webhook: true,
  });
}
