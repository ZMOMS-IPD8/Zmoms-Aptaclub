/* File: lib/google-apps-script/orders-query.ts */

export type RegisteredOrder = {
  orderDate: string;
  receiverName: string;
  registrationPhone: string;
  shippingAddress: string;
  orderStatus: string;
  fulfillmentStatus: string;
  pancakeId: string;
  isRegistered: boolean;
  rowNumber: number;
};

export type OrdersPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type OrdersByFulfillmentStatus = {
  status: string;
  count: number;
};

export type OrdersDashboardPeriod = {
  totalOrders: number;
  registeredPancake: number;
  notRegisteredPancake: number;
  pendingOrders: number;
  completedOrders: number;
  techcombankOrders: number;
  vietcombankOrders: number;
  ordersByFulfillmentStatus: OrdersByFulfillmentStatus[];
};

export type OrdersDashboard = {
  totalOrders: number;
  totalRegisteredPancake: number;
  totalNotRegisteredPancake: number;
  period: OrdersDashboardPeriod;
  filteredOrders: number;
};

export type RegisteredOrdersResponse = {
  success: boolean;
  status?: string;
  message?: string;
  data: RegisteredOrder[];
  pagination: OrdersPagination;
  dashboard?: OrdersDashboard;
};

export type FulfillmentStatusesResponse = {
  success: boolean;
  status?: string;
  message?: string;
  data: string[];
};

type AppsScriptErrorResponse = {
  success?: boolean;
  status?: string;
  message?: string;
};

type RegisteredOrdersParams = {
  seller: string;
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  fulfillmentStatus?: string;
};

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function parseResponse(text: string): unknown {
  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(result: unknown): string {
  if (typeof result === "string") {
    if (result.includes("<!DOCTYPE html") || result.includes("<html")) {
      return "Google Apps Script trả về HTML thay vì JSON. Hãy kiểm tra URL /exec, quyền truy cập và phiên bản triển khai.";
    }

    return (
      result.trim().slice(0, 500) ||
      "Phản hồi từ Google Apps Script không hợp lệ."
    );
  }

  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return "Google Apps Script không trả về dữ liệu hợp lệ.";
  }

  const data = result as AppsScriptErrorResponse;
  const status = normalizeText(data.status);
  const message = normalizeText(data.message);

  return (
    [status, message].filter(Boolean).join(": ") ||
    "Không thể lấy dữ liệu từ Google Apps Script."
  );
}

function isValidOrder(item: unknown): item is RegisteredOrder {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return false;
  }

  const order = item as Record<string, unknown>;

  return (
    typeof order.orderDate === "string" &&
    typeof order.receiverName === "string" &&
    typeof order.registrationPhone === "string" &&
    typeof order.shippingAddress === "string" &&
    typeof order.orderStatus === "string" &&
    typeof order.fulfillmentStatus === "string" &&
    typeof order.pancakeId === "string" &&
    typeof order.isRegistered === "boolean" &&
    typeof order.rowNumber === "number" &&
    Number.isFinite(order.rowNumber)
  );
}

function isValidPagination(value: unknown): value is OrdersPagination {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const pagination = value as Record<string, unknown>;

  return (
    typeof pagination.page === "number" &&
    Number.isInteger(pagination.page) &&
    pagination.page >= 1 &&
    typeof pagination.pageSize === "number" &&
    Number.isInteger(pagination.pageSize) &&
    pagination.pageSize >= 1 &&
    typeof pagination.total === "number" &&
    Number.isInteger(pagination.total) &&
    pagination.total >= 0 &&
    typeof pagination.totalPages === "number" &&
    Number.isInteger(pagination.totalPages) &&
    pagination.totalPages >= 0
  );
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isValidOrdersDashboard(value: unknown): value is OrdersDashboard {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const dashboard = value as Record<string, unknown>;

  if (
    !isNonNegativeInteger(dashboard.totalOrders) ||
    !isNonNegativeInteger(dashboard.totalRegisteredPancake) ||
    !isNonNegativeInteger(dashboard.totalNotRegisteredPancake) ||
    !isNonNegativeInteger(dashboard.filteredOrders)
  ) {
    return false;
  }

  if (
    !dashboard.period ||
    typeof dashboard.period !== "object" ||
    Array.isArray(dashboard.period)
  ) {
    return false;
  }

  const period = dashboard.period as Record<string, unknown>;

  if (
    !isNonNegativeInteger(period.totalOrders) ||
    !isNonNegativeInteger(period.registeredPancake) ||
    !isNonNegativeInteger(period.notRegisteredPancake) ||
    !isNonNegativeInteger(period.pendingOrders) ||
    !isNonNegativeInteger(period.completedOrders) ||
    !isNonNegativeInteger(period.techcombankOrders) ||
    !isNonNegativeInteger(period.vietcombankOrders) ||
    !Array.isArray(period.ordersByFulfillmentStatus)
  ) {
    return false;
  }

  return period.ordersByFulfillmentStatus.every((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return false;
    }

    const status = item as Record<string, unknown>;

    return (
      typeof status.status === "string" && isNonNegativeInteger(status.count)
    );
  });
}

function getInvalidOrderDetails(item: unknown): string {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return `Kiểu dữ liệu nhận được: ${item === null ? "null" : typeof item}`;
  }

  const order = item as Record<string, unknown>;

  const expectedTypes: Record<string, string> = {
    orderDate: "string",
    receiverName: "string",
    registrationPhone: "string",
    shippingAddress: "string",
    orderStatus: "string",
    fulfillmentStatus: "string",
    pancakeId: "string",
    isRegistered: "boolean",
    rowNumber: "number",
  };

  const problems = Object.entries(expectedTypes)
    .filter(([key, expected]) => {
      const value = order[key];

      if (expected === "number") {
        return typeof value !== "number" || !Number.isFinite(value);
      }

      return typeof value !== expected;
    })
    .map(([key, expected]) => {
      const value = order[key];

      const actual =
        value === null ? "null" : Array.isArray(value) ? "array" : typeof value;

      return `${key}: cần ${expected}, nhận ${actual}`;
    });

  return problems.length
    ? problems.join("; ")
    : `Các trường nhận được: ${Object.keys(order).join(", ")}`;
}

function isValidDateFilter(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function getAppsScriptConfig(): {
  scriptUrl: string;
  scriptSecret: string;
} {
  const scriptUrl = process.env.ORDER_APPS_SCRIPT_URL;
  const scriptSecret = process.env.ORDER_APPS_SCRIPT_SECRET;

  if (!scriptUrl || !scriptSecret) {
    throw new Error(
      "Chưa cấu hình ORDER_APPS_SCRIPT_URL hoặc ORDER_APPS_SCRIPT_SECRET.",
    );
  }

  if (
    !scriptUrl.startsWith("https://script.google.com/macros/s/") ||
    !scriptUrl.endsWith("/exec")
  ) {
    throw new Error(
      "ORDER_APPS_SCRIPT_URL không đúng URL Google Apps Script Web App /exec.",
    );
  }

  return {
    scriptUrl,
    scriptSecret,
  };
}

async function callAppsScript(
  action: string,
  payload: Record<string, unknown> = {},
): Promise<unknown> {
  const { scriptUrl, scriptSecret } = getAppsScriptConfig();

  let response: Response;

  try {
    response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        action,
        secret: scriptSecret,
        ...payload,
      }),
      cache: "no-store",
      redirect: "follow",
    });
  } catch {
    throw new Error(
      "Không thể kết nối Google Apps Script. Vui lòng kiểm tra kết nối và thử lại.",
    );
  }

  let responseText: string;

  try {
    responseText = await response.text();
  } catch {
    throw new Error("Không thể đọc phản hồi từ Google Apps Script.");
  }

  const result = parseResponse(responseText);

  if (!response.ok) {
    throw new Error(
      `Google Apps Script HTTP ${response.status}: ${getErrorMessage(result)}`,
    );
  }

  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw new Error(
      `Phản hồi Google Apps Script không hợp lệ: ${getErrorMessage(result)}`,
    );
  }

  const responseData = result as Record<string, unknown>;

  if (responseData.success !== true) {
    throw new Error(getErrorMessage(responseData));
  }

  return responseData;
}

export async function getRegisteredOrdersFromAppsScript(
  params: RegisteredOrdersParams,
): Promise<RegisteredOrdersResponse> {
  const seller = normalizeText(params.seller);
  const startDate = normalizeText(params.startDate);
  const endDate = normalizeText(params.endDate);
  const fulfillmentStatus = normalizeText(params.fulfillmentStatus);

  const page = Math.max(1, Math.floor(Number(params.page) || 1));

  const pageSize = Math.min(
    100,
    Math.max(1, Math.floor(Number(params.pageSize) || 20)),
  );

  if (!seller) {
    throw new Error("Thiếu thông tin người bán.");
  }

  if (
    (startDate && !isValidDateFilter(startDate)) ||
    (endDate && !isValidDateFilter(endDate))
  ) {
    throw new Error("Ngày lọc phải có định dạng YYYY-MM-DD và là ngày hợp lệ.");
  }

  if (startDate && endDate && startDate > endDate) {
    throw new Error("Ngày bắt đầu không được sau ngày kết thúc.");
  }

  const result = await callAppsScript("get_registered_orders", {
    seller,
    page,
    pageSize,
    startDate,
    endDate,
    fulfillmentStatus,
  });

  const payload = result as Record<string, unknown>;

  if (!Array.isArray(payload.data)) {
    throw new Error(
      `Dữ liệu danh sách đơn hàng không đúng cấu trúc: data phải là mảng, nhận ${typeof payload.data}.`,
    );
  }

  if (!isValidPagination(payload.pagination)) {
    const pagination =
      payload.pagination &&
      typeof payload.pagination === "object" &&
      !Array.isArray(payload.pagination)
        ? (payload.pagination as Record<string, unknown>)
        : null;

    throw new Error(
      `Pagination không hợp lệ. Các trường nhận được: ${
        pagination
          ? Object.keys(pagination).join(", ")
          : String(payload.pagination)
      }.`,
    );
  }

  const invalidIndex = payload.data.findIndex((item) => !isValidOrder(item));

  if (invalidIndex !== -1) {
    throw new Error(
      `Đơn hàng tại vị trí ${invalidIndex} không đúng cấu trúc. ${getInvalidOrderDetails(
        payload.data[invalidIndex],
      )}.`,
    );
  }

  let dashboard: OrdersDashboard | undefined;

  if (payload.dashboard !== undefined) {
    if (!isValidOrdersDashboard(payload.dashboard)) {
      throw new Error(
        "Dữ liệu dashboard không đúng cấu trúc. Hãy kiểm tra dashboard trong Google Apps Script, bao gồm techcombankOrders và vietcombankOrders.",
      );
    }

    dashboard = payload.dashboard;
  }

  return {
    success: true,
    status: typeof payload.status === "string" ? payload.status : undefined,
    message: typeof payload.message === "string" ? payload.message : undefined,
    data: payload.data as RegisteredOrder[],
    pagination: payload.pagination,
    dashboard,
  };
}

export async function getOrderFulfillmentStatusesFromAppsScript(): Promise<FulfillmentStatusesResponse> {
  const result = await callAppsScript("get_fulfillment_statuses");

  const payload = result as Record<string, unknown>;

  if (!Array.isArray(payload.data)) {
    throw new Error(
      "Dữ liệu tình trạng đơn hàng không đúng cấu trúc: data phải là mảng.",
    );
  }

  const invalidIndex = payload.data.findIndex(
    (item) => typeof item !== "string",
  );

  if (invalidIndex !== -1) {
    throw new Error(`Tình trạng tại vị trí ${invalidIndex} không phải chuỗi.`);
  }

  const statuses = Array.from(
    new Set(
      (payload.data as string[]).map((status) => status.trim()).filter(Boolean),
    ),
  );

  return {
    success: true,
    status: typeof payload.status === "string" ? payload.status : undefined,
    message: typeof payload.message === "string" ? payload.message : undefined,
    data: statuses,
  };
}
