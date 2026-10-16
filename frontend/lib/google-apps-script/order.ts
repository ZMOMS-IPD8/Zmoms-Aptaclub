type OrderAppsScriptResponse = {
  success: boolean;
  status?: string;
  message?: string;
  orderId?: string;
  rowNumber?: number;
  orderDate?: string;
};

export type OrderAppsScriptPayload = {
  registrationPhone: string;
  receiverName: string;
  shippingPhone: string;
  shippingAddress: string;
  nguoiBan: string;
  salesSource: string;
  bank: string;
  loaiDon: string;
  orderDate: string;
  note?: string;
};

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function isValidIsoDate(value: string): boolean {
  const normalized = normalizeText(value);

  if (!normalized || !/(?:Z|[+-]\d{2}:\d{2})$/i.test(normalized)) {
    return false;
  }

  return Number.isFinite(Date.parse(normalized));
}

function parseResponse(text: string): unknown {
  if (!text.trim()) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(result: unknown): string {
  if (typeof result === "string") {
    if (result.includes("<!DOCTYPE html") || result.includes("<html")) {
      return "Google Apps Script trả về HTML thay vì JSON. Hãy kiểm tra URL /exec, quyền truy cập Web App và phiên bản triển khai.";
    }

    return (
      result.trim().slice(0, 500) ||
      "Phản hồi từ Google Apps Script không hợp lệ."
    );
  }

  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return "Google Apps Script không trả về dữ liệu hợp lệ.";
  }

  const data = result as {
    message?: unknown;
    status?: unknown;
  };

  const message = typeof data.message === "string" ? data.message.trim() : "";

  const status = typeof data.status === "string" ? data.status.trim() : "";

  return (
    [status, message].filter(Boolean).join(": ") ||
    "Không thể ghi thông tin đơn hàng vào Google Sheets."
  );
}

function validatePayload(payload: OrderAppsScriptPayload): void {
  const requiredFields: Array<[keyof OrderAppsScriptPayload, string]> = [
    ["registrationPhone", "Số điện thoại đăng ký"],
    ["receiverName", "Họ và tên người nhận"],
    ["shippingPhone", "Số điện thoại nhận hàng"],
    ["shippingAddress", "Địa chỉ nhận hàng"],
    ["nguoiBan", "Người bán"],
    ["salesSource", "Nguồn bán"],
    ["bank", "Ngân hàng"],
    ["loaiDon", "Loại đơn"],
    ["orderDate", "Thời gian lên đơn"],
  ];

  for (const [field, label] of requiredFields) {
    const value = payload[field];

    if (typeof value !== "string" || !value.trim()) {
      throw new Error(`Thiếu thông tin: ${label}.`);
    }
  }

  if (!/^0\d{9}$/.test(payload.registrationPhone.trim())) {
    throw new Error("Số điện thoại đăng ký không hợp lệ.");
  }

  if (!/^0\d{9}$/.test(payload.shippingPhone.trim())) {
    throw new Error("Số điện thoại nhận hàng không hợp lệ.");
  }

  if (!["Tặng", "Bán"].includes(payload.loaiDon.trim())) {
    throw new Error("Loại đơn phải là Tặng hoặc Bán.");
  }

  if (!["Techcombank", "Vietcombank"].includes(payload.bank.trim())) {
    throw new Error("Ngân hàng không hợp lệ.");
  }

  if (!isValidIsoDate(payload.orderDate)) {
    throw new Error("Thời gian lên đơn không hợp lệ.");
  }
}

export async function submitOrderToAppsScript(
  payload: OrderAppsScriptPayload,
): Promise<OrderAppsScriptResponse> {
  const scriptUrl = process.env.ORDER_APPS_SCRIPT_URL;
  const scriptSecret = process.env.ORDER_APPS_SCRIPT_SECRET;

  if (!scriptUrl || !scriptSecret) {
    throw new Error("Chưa cấu hình Google Apps Script cho đơn hàng.");
  }

  if (
    !scriptUrl.startsWith("https://script.google.com/macros/s/") ||
    !scriptUrl.endsWith("/exec")
  ) {
    throw new Error("ORDER_APPS_SCRIPT_URL không đúng URL Web App /exec.");
  }

  validatePayload(payload);

  const normalizedOrderDate = new Date(payload.orderDate.trim()).toISOString();

  const registrationPhone = payload.registrationPhone.trim();
  const shippingPhone = payload.shippingPhone.trim();

  const normalizedPayload: OrderAppsScriptPayload = {
    registrationPhone,
    receiverName: payload.receiverName.trim(),
    shippingPhone,
    shippingAddress: payload.shippingAddress.trim(),
    nguoiBan: payload.nguoiBan.trim(),
    salesSource: payload.salesSource.trim(),
    bank: payload.bank.trim(),
    loaiDon: payload.loaiDon.trim(),
    orderDate: normalizedOrderDate,
    note:
      registrationPhone !== shippingPhone ? normalizeText(payload.note) : "",
  };

  let response: Response;

  try {
    response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        action: "create_order",
        secret: scriptSecret,
        ...normalizedPayload,
      }),
      cache: "no-store",
      redirect: "follow",
    });
  } catch {
    throw new Error("Không thể kết nối Google Apps Script. Vui lòng thử lại.");
  }

  const text = await response.text();
  const result = parseResponse(text);

  if (!response.ok) {
    throw new Error(
      `Google Apps Script HTTP ${response.status}: ${getErrorMessage(result)}`,
    );
  }

  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw new Error(getErrorMessage(result));
  }

  const data = result as Partial<OrderAppsScriptResponse>;

  if (data.success !== true) {
    throw new Error(getErrorMessage(data));
  }

  const rowNumber =
    typeof data.rowNumber === "number" &&
    Number.isFinite(data.rowNumber) &&
    data.rowNumber >= 1
      ? data.rowNumber
      : undefined;

  return {
    success: true,
    status: data.status,
    message: data.message,
    orderId: data.orderId,
    rowNumber,
    orderDate: normalizedOrderDate,
  };
}
