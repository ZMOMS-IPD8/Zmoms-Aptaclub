/* File: app/check-user/hooks/use-registered-orders.ts */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

type RegisteredOrdersResponse = {
  success: boolean;
  status?: string;
  message?: string;
  data: RegisteredOrder[];
  pagination: OrdersPagination;
  employee?: {
    full_name: string;
  };
  dashboard?: OrdersDashboard;
};

type FulfillmentStatusesResponse = {
  success: boolean;
  status?: string;
  message?: string;
  data: string[];
};

const DEFAULT_PAGE_SIZE = 20;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isValidOrder(value: unknown): value is RegisteredOrder {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.orderDate === "string" &&
    typeof value.receiverName === "string" &&
    typeof value.registrationPhone === "string" &&
    typeof value.shippingAddress === "string" &&
    typeof value.orderStatus === "string" &&
    typeof value.fulfillmentStatus === "string" &&
    typeof value.pancakeId === "string" &&
    typeof value.isRegistered === "boolean" &&
    typeof value.rowNumber === "number" &&
    Number.isFinite(value.rowNumber)
  );
}

function isValidPagination(value: unknown): value is OrdersPagination {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.page === "number" &&
    Number.isInteger(value.page) &&
    value.page >= 1 &&
    typeof value.pageSize === "number" &&
    Number.isInteger(value.pageSize) &&
    value.pageSize >= 1 &&
    isNonNegativeInteger(value.total) &&
    isNonNegativeInteger(value.totalPages)
  );
}

function isValidDashboardPeriod(
  value: unknown,
): value is OrdersDashboardPeriod {
  if (!isRecord(value)) {
    return false;
  }

  if (
    !isNonNegativeInteger(value.totalOrders) ||
    !isNonNegativeInteger(value.registeredPancake) ||
    !isNonNegativeInteger(value.notRegisteredPancake) ||
    !isNonNegativeInteger(value.pendingOrders) ||
    !isNonNegativeInteger(value.completedOrders) ||
    !isNonNegativeInteger(value.techcombankOrders) ||
    !isNonNegativeInteger(value.vietcombankOrders) ||
    !Array.isArray(value.ordersByFulfillmentStatus)
  ) {
    return false;
  }

  return value.ordersByFulfillmentStatus.every(
    (item) =>
      isRecord(item) &&
      typeof item.status === "string" &&
      isNonNegativeInteger(item.count),
  );
}

function isValidDashboard(value: unknown): value is OrdersDashboard {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNonNegativeInteger(value.totalOrders) &&
    isNonNegativeInteger(value.totalRegisteredPancake) &&
    isNonNegativeInteger(value.totalNotRegisteredPancake) &&
    isNonNegativeInteger(value.filteredOrders) &&
    isValidDashboardPeriod(value.period)
  );
}

function isValidStatusesResponse(
  value: unknown,
): value is FulfillmentStatusesResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.success === true &&
    Array.isArray(value.data) &&
    value.data.every((status) => typeof status === "string")
  );
}

function getResponseError(result: unknown, fallback: string): string {
  if (isRecord(result) && typeof result.message === "string") {
    const message = result.message.trim();

    if (message) {
      return message;
    }
  }

  return fallback;
}

async function fetchJson(
  url: string,
  signal: AbortSignal,
): Promise<{ response: Response; result: unknown }> {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    signal,
    headers: {
      Accept: "application/json",
    },
  });

  let result: unknown;

  try {
    result = await response.json();
  } catch {
    throw new Error("API trả về dữ liệu không hợp lệ.");
  }

  return {
    response,
    result,
  };
}

export function useRegisteredOrders(
  startDate = "",
  endDate = "",
  fulfillmentStatus = "",
) {
  const [orders, setOrders] = useState<RegisteredOrder[]>([]);

  const [pagination, setPagination] = useState<OrdersPagination>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });

  const [employeeName, setEmployeeName] = useState("");
  const [dashboard, setDashboard] = useState<OrdersDashboard | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const [fulfillmentStatuses, setFulfillmentStatuses] = useState<string[]>([]);
  const [statusesLoading, setStatusesLoading] = useState(true);
  const [statusesError, setStatusesError] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [page, setPageState] = useState(1);

  const previousFilters = useRef({
    startDate,
    endDate,
    fulfillmentStatus: fulfillmentStatus.trim(),
  });

  const normalizedStatus = fulfillmentStatus.trim();
  const pageSize = pagination.pageSize;

  useEffect(() => {
    const previous = previousFilters.current;

    const filtersChanged =
      previous.startDate !== startDate ||
      previous.endDate !== endDate ||
      previous.fulfillmentStatus !== normalizedStatus;

    previousFilters.current = {
      startDate,
      endDate,
      fulfillmentStatus: normalizedStatus,
    };

    if (filtersChanged) {
      setPageState(1);
    }
  }, [startDate, endDate, normalizedStatus]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStatuses() {
      setStatusesLoading(true);
      setStatusesError("");

      try {
        const { response, result } = await fetchJson(
          "/api/check-user/registered-orders?action=fulfillment-statuses",
          controller.signal,
        );

        if (controller.signal.aborted) {
          return;
        }

        if (!response.ok || !isValidStatusesResponse(result)) {
          throw new Error(
            getResponseError(
              result,
              "Không thể lấy danh sách tình trạng đơn hàng.",
            ),
          );
        }

        const statuses = Array.from(
          new Set(result.data.map((status) => status.trim()).filter(Boolean)),
        );

        setFulfillmentStatuses(statuses);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        setStatusesError(
          err instanceof Error
            ? err.message
            : "Không thể lấy danh sách tình trạng đơn hàng.",
        );

        setFulfillmentStatuses([]);
      } finally {
        if (!controller.signal.aborted) {
          setStatusesLoading(false);
        }
      }
    }

    void loadStatuses();

    return () => controller.abort();
  }, [reloadKey]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOrders() {
      if (startDate && endDate && startDate > endDate) {
        setError("Ngày bắt đầu không được sau ngày kết thúc.");
        setOrders([]);
        setDashboard(null);
        setPagination((current) => ({
          ...current,
          page: 1,
          total: 0,
          totalPages: 0,
        }));
        setLoading(false);
        setDashboardLoading(false);
        return;
      }

      setLoading(true);
      setDashboardLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
        });

        if (startDate) {
          params.set("startDate", startDate);
        }

        if (endDate) {
          params.set("endDate", endDate);
        }

        if (normalizedStatus) {
          params.set("fulfillmentStatus", normalizedStatus);
        }

        const { response, result } = await fetchJson(
          `/api/check-user/registered-orders?${params.toString()}`,
          controller.signal,
        );

        if (controller.signal.aborted) {
          return;
        }

        if (!isRecord(result)) {
          throw new Error("API trả về dữ liệu không đúng cấu trúc.");
        }

        if (!response.ok || result.success !== true) {
          throw new Error(
            getResponseError(result, "Không thể lấy danh sách đơn hàng."),
          );
        }

        if (
          !Array.isArray(result.data) ||
          !result.data.every(isValidOrder) ||
          !isValidPagination(result.pagination)
        ) {
          throw new Error("Dữ liệu danh sách đơn hàng không đúng cấu trúc.");
        }

        const responsePagination = result.pagination;

        setOrders(result.data);
        setPagination((current) => ({
          ...current,
          ...responsePagination,
        }));

        const employee = result.employee;

        setEmployeeName(
          isRecord(employee) && typeof employee.full_name === "string"
            ? employee.full_name
            : "",
        );

        if (result.dashboard === undefined || result.dashboard === null) {
          setDashboard(null);
        } else if (isValidDashboard(result.dashboard)) {
          setDashboard(result.dashboard);
        } else {
          setDashboard(null);

          throw new Error(
            "Dữ liệu thống kê dashboard không đúng cấu trúc. Vui lòng kiểm tra API Google Apps Script, đặc biệt hai trường techcombankOrders và vietcombankOrders.",
          );
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Đã xảy ra lỗi khi lấy danh sách đơn hàng.",
        );

        setOrders([]);
        setDashboard(null);
        setPagination((current) => ({
          ...current,
          total: 0,
          totalPages: 0,
        }));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setDashboardLoading(false);
        }
      }
    }

    void loadOrders();

    return () => controller.abort();
  }, [startDate, endDate, normalizedStatus, page, pageSize, reloadKey]);

  const setPage = useCallback(
    (nextPage: number) => {
      setPageState(
        Math.max(
          1,
          Math.min(pagination.totalPages || 1, Math.floor(nextPage) || 1),
        ),
      );
    },
    [pagination.totalPages],
  );

  const setPageSize = useCallback((nextPageSize: number) => {
    const normalizedPageSize = Math.min(
      100,
      Math.max(1, Math.floor(nextPageSize) || DEFAULT_PAGE_SIZE),
    );

    setPageState(1);

    setPagination((current) => ({
      ...current,
      page: 1,
      pageSize: normalizedPageSize,
    }));
  }, []);

  const refresh = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  return {
    orders,
    pagination: {
      ...pagination,
      page,
      pageSize,
    },
    dashboard,
    dashboardLoading,
    employeeName,
    fulfillmentStatuses,
    statusesLoading,
    statusesError,
    loading,
    error,
    setPage,
    setPageSize,
    refresh,
  };
}
