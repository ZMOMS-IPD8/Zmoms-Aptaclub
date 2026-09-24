import { NextResponse } from "next/server";

type PancakeLead = {
  id?: string;
  name?: string | null;
  phone_number?: string | null;
  [key: string]: unknown;
};

type PancakeResponse = {
  success?: boolean;
  data?: {
    entries?: PancakeLead[];
    total_entries?: number;
    [key: string]: unknown;
  };
  message?: string;
  error?: string;
};

function getFieldValue(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value).trim();
  }

  if (value && typeof value === "object" && "value" in value) {
    return String((value as { value?: unknown }).value ?? "").trim();
  }

  return "";
}

function getNumericValue(value: unknown): number {
  const normalized = getFieldValue(value);

  if (!normalized) {
    return 0;
  }

  const number = Number(normalized.replace(/[^\d.-]/g, ""));

  return Number.isFinite(number) ? number : 0;
}

function normalizeStatus(value: unknown): string {
  return getFieldValue(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isPaidStatus(value: unknown): boolean {
  const status = normalizeStatus(value);

  return (
    status.includes("da thanh toan") ||
    status.includes("paid") ||
    status.includes("success") ||
    status.includes("thanh toan thanh cong")
  );
}

async function getLeads(): Promise<PancakeLead[]> {
  const workspaceId = process.env.PANCAKE_WORKSPACE_ID;

  const apiKey = process.env.PANCAKE_CRM_API_KEY;

  if (!workspaceId || !apiKey) {
    throw new Error("Chưa cấu hình Pancake CRM API.");
  }

  const url =
    `https://crm.pancake.vn/api/workspaces/` +
    `${workspaceId}/lead/records` +
    `?api_key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const text = await response.text();

  let result: PancakeResponse = {};

  if (text.trim()) {
    try {
      result = JSON.parse(text) as PancakeResponse;
    } catch {
      throw new Error("Pancake CRM trả về dữ liệu không hợp lệ.");
    }
  }

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        `Pancake CRM trả lỗi HTTP ${response.status}.`,
    );
  }

  return Array.isArray(result.data?.entries) ? result.data.entries : [];
}

function isOrder(lead: PancakeLead): boolean {
  const hasOrderDate = getFieldValue(lead.ngay_dat_hang) !== "";

  const hasOrderCode = getFieldValue(lead.ma_don_hang) !== "";

  return hasOrderDate && hasOrderCode;
}

function formatOrder(lead: PancakeLead) {
  return {
    id: getFieldValue(lead.id),

    name: getFieldValue(lead.ho_va_ten_lien_he) || getFieldValue(lead.name),

    phone:
      getFieldValue(lead.so_dien_thoai_dang_ky) ||
      getFieldValue(lead.phone_number),

    orderCode: getFieldValue(lead.ma_don_hang),

    combo: getFieldValue(lead.ten_combo),

    orderDate: getFieldValue(lead.ngay_dat_hang),

    sellerCode: getFieldValue(lead.ma_nguoi_ban),

    receiverName: getFieldValue(lead.ten_nguoi_nhan),

    receiverPhone: getFieldValue(lead.so_dien_thoai_giao_hang),

    amount: getNumericValue(lead.gia_tien),

    deliveryStatus: getFieldValue(lead.trang_thai_giao_hang),

    paymentStatus: getFieldValue(lead.trang_thai_thanh_toan),

    deliveredDate: getFieldValue(lead.ngay_giao_thanh_cong),
  };
}

export async function GET() {
  try {
    const leads = await getLeads();

    const orders = leads.filter(isOrder).map(formatOrder);

    const paidOrders = orders.filter((order) =>
      isPaidStatus(order.paymentStatus),
    );

    const revenue = paidOrders.reduce(
      (total, order) => total + order.amount,
      0,
    );

    return NextResponse.json({
      success: true,
      data: {
        total: orders.length,
        paid: paidOrders.length,
        unpaid: orders.length - paidOrders.length,
        revenue,
        orders,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể lấy dữ liệu đơn hàng.",
      },
      { status: 500 },
    );
  }
}
