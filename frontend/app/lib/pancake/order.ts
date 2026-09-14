import { PANCAKE_POS_CONFIG } from "./pos";
import { getPancakePaymentInfo, type PancakePaymentInfo } from "./payment";

type ComboType = "small" | "large";

type CreatePancakeOrderParams = {
  combo: ComboType;
  phone: string;
  fullName: string;
  orderCode: string;
};

type PancakeOrderResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  data?: unknown;
  [key: string]: unknown;
};

async function parsePancakeResponse(
  response: Response,
): Promise<PancakeOrderResponse> {
  const text = await response.text();

  if (!text.trim()) {
    return {};
  }

  try {
    return JSON.parse(text) as PancakeOrderResponse;
  } catch {
    return {
      message: text.slice(0, 500),
    };
  }
}

function getPancakeErrorMessage(
  result: PancakeOrderResponse,
  response: Response,
): string {
  if (typeof result.message === "string" && result.message.trim()) {
    return result.message.trim();
  }

  if (typeof result.error === "string" && result.error.trim()) {
    return result.error.trim();
  }

  return `Pancake POS trả lỗi HTTP ${response.status}.`;
}

function findTrackingLink(value: unknown): string {
  if (!value || typeof value !== "object") {
    return "";
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const trackingLink = findTrackingLink(item);

      if (trackingLink) {
        return trackingLink;
      }
    }

    return "";
  }

  const object = value as Record<string, unknown>;

  if (typeof object.tracking_link === "string" && object.tracking_link.trim()) {
    return object.tracking_link.trim();
  }

  if (typeof object.trackingLink === "string" && object.trackingLink.trim()) {
    return object.trackingLink.trim();
  }

  for (const child of Object.values(object)) {
    const trackingLink = findTrackingLink(child);

    if (trackingLink) {
      return trackingLink;
    }
  }

  return "";
}

export async function createPancakeOrder({
  combo,
  phone,
  fullName,
  orderCode,
}: CreatePancakeOrderParams) {
  const config = PANCAKE_POS_CONFIG[combo];

  const apiKey = process.env.PANCAKE_POS_API_KEY;

  if (!apiKey) {
    throw new Error("Chưa cấu hình Pancake POS API.");
  }

  if (!PANCAKE_POS_CONFIG.shopId) {
    throw new Error("Chưa cấu hình PANCAKE_SHOP_ID.");
  }

  if (!config.productId || !config.variationId) {
    throw new Error("Chưa cấu hình sản phẩm Pancake cho combo.");
  }

  const cleanPhone = String(phone).trim().replace(/\D/g, "");

  if (!/^0\d{9}$/.test(cleanPhone)) {
    throw new Error("Số điện thoại không hợp lệ.");
  }

  const paymentReference = `${config.paymentCode} ${cleanPhone}`;

  const url =
    `https://pos.pages.fm/api/v1/shops/` +
    `${PANCAKE_POS_CONFIG.shopId}/orders` +
    `?api_key=${encodeURIComponent(apiKey)}`;

  const payload = {
    bill_full_name: fullName || "Khách hàng ZMOMS",
    bill_phone_number: cleanPhone,
    items: [
      {
        quantity: 1,
        variation_id: config.variationId,
        product_id: config.productId,
        variation_info: {
          name: config.name,
          product_display_id: config.displayId,
          retail_price: config.price,
        },
        discount_each_product: 0,
        is_bonus_product: false,
        is_discount_percent: false,
        is_wholesale: false,
        one_time_product: false,
      },
    ],
    note: paymentReference,
    shipping_fee: 0,
    total_discount: 0,
    custom_id: orderCode,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const result = await parsePancakeResponse(response);

  if (!response.ok || !result.success) {
    throw new Error(getPancakeErrorMessage(result, response));
  }

  const trackingLink = findTrackingLink(result);

  if (!trackingLink) {
    throw new Error(
      "Tạo đơn thành công nhưng Pancake không trả tracking link.",
    );
  }

  const payment: PancakePaymentInfo = await getPancakePaymentInfo(trackingLink);

  return {
    result,
    orderCode,
    combo,
    amount: payment.amount,
    productId: config.productId,
    variationId: config.variationId,
    paymentReference,
    trackingLink,
    payment,
  };
}
