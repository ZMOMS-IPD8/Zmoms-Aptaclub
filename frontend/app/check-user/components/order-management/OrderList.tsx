/* File: OrderList.tsx */

"use client";

import { useState } from "react";
import { useRegisteredOrders } from "../../hooks/use-registered-orders";

type Props = {
  startDate: string;
  endDate: string;
};

function formatDate(value: string) {
  return value || "—";
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function normalizeStatus(value: string) {
  return value.trim().toLocaleLowerCase("vi-VN");
}

function getStatusDisplayValue(value: string) {
  const normalized = normalizeStatus(value);

  if (normalized === "tặng" || normalized === "techcombank") {
    return "Techcombank";
  }

  if (normalized === "bán" || normalized === "vietcombank") {
    return "Vietcombank";
  }

  return value.trim() || "—";
}

function StatusBadge({ value }: { value: string }) {
  const normalized = normalizeStatus(value);

  const isTechcombank = normalized === "techcombank" || normalized === "tặng";

  const isVietcombank = normalized === "vietcombank" || normalized === "bán";

  const className = isTechcombank
    ? "border-purple-100 bg-purple-50 text-purple-700"
    : isVietcombank
      ? "border-blue-100 bg-blue-50 text-blue-700"
      : "border-gray-200 bg-gray-50 text-gray-600";

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {getStatusDisplayValue(value)}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  description,
  accent = "blue",
  loading = false,
}: {
  label: string;
  value: number;
  description?: string;
  accent?: "blue" | "navy" | "purple";
  loading?: boolean;
}) {
  const accentClasses = {
    blue: "border-l-[#18A8DC]",
    navy: "border-l-[#12335B]",
    purple: "border-l-purple-500",
  };

  return (
    <div
      className={`min-w-0 rounded-xl border border-[#E5EBF2] border-l-4 bg-white p-4 shadow-sm ${accentClasses[accent]}`}
    >
      <p className="text-sm font-medium leading-5 text-gray-500">{label}</p>

      {loading ? (
        <div className="mt-3 h-8 w-20 animate-pulse rounded-md bg-gray-100" />
      ) : (
        <p className="mt-2 break-words text-2xl font-extrabold tabular-nums text-[#12335B]">
          {formatNumber(value)}
        </p>
      )}

      {description && (
        <p className="mt-2 text-xs leading-5 text-gray-400">{description}</p>
      )}
    </div>
  );
}

export default function OrderList({ startDate, endDate }: Props) {
  const [fulfillmentStatus, setFulfillmentStatus] = useState("");

  const {
    orders,
    pagination,
    dashboard,
    dashboardLoading,
    loading,
    error,
    fulfillmentStatuses,
    statusesLoading,
    statusesError,
    setPage,
    setPageSize,
    refresh,
  } = useRegisteredOrders(startDate, endDate, fulfillmentStatus);

  function handleStatusChange(value: string) {
    setFulfillmentStatus(value);
    setPage(1);
  }

  const periodLabel =
    startDate || endDate
      ? `${startDate || "Từ đầu"} – ${endDate || "Hiện tại"}`
      : "Tất cả thời gian";

  const dashboardLoadingState = dashboardLoading && !dashboard;

  const periodStats = dashboard?.period;

  return (
    <div className="space-y-6">
      <section aria-label="Thống kê đơn hàng" className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#18A8DC]">
              Tổng quan
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#12335B]">
              Thống kê đơn hàng
            </h2>
          </div>

          <p className="text-xs text-gray-500">Kỳ thống kê: {periodLabel}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Tổng đơn của bạn"
            value={dashboard?.totalOrders ?? 0}
            description="Tất cả thời gian"
            accent="navy"
            loading={dashboardLoadingState}
          />

          <SummaryCard
            label="Đơn trong kỳ"
            value={periodStats?.totalOrders ?? 0}
            description="Theo khoảng ngày đang chọn"
            accent="blue"
            loading={dashboardLoadingState}
          />

          <SummaryCard
            label="Đơn Techcombank"
            value={periodStats?.techcombankOrders ?? 0}
            accent="purple"
            loading={dashboardLoadingState}
          />

          <SummaryCard
            label="Đơn Vietcombank"
            value={periodStats?.vietcombankOrders ?? 0}
            accent="blue"
            loading={dashboardLoadingState}
          />
        </div>

        {!dashboard && !dashboardLoading && !error && (
          <div
            role="status"
            className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700"
          >
            Chưa có dữ liệu thống kê. Vui lòng kiểm tra phản hồi dashboard từ
            Google Apps Script.
          </div>
        )}
      </section>

      <section
        aria-label="Danh sách đơn hàng"
        className="overflow-hidden rounded-2xl border border-[#E5EBF2] bg-white shadow-sm"
      >
        <div className="flex flex-col gap-4 border-b border-[#E8EDF3] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-bold text-[#12335B] sm:text-lg">
              Danh sách đơn hàng
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Khoảng thời gian: {periodLabel}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {fulfillmentStatus ? `Tình trạng: ${fulfillmentStatus} · ` : ""}
              Tổng cộng {formatNumber(pagination.total)} đơn phù hợp
            </p>
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={loading || statusesLoading}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#D8E1EB] px-4 text-sm font-semibold text-[#12335B] transition hover:border-[#18A8DC] hover:bg-[#F3FBFE] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              className={`h-4 w-4 ${
                loading || statusesLoading ? "animate-spin" : ""
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 7v5h-5" />
              <path d="M4 17v-5h5" />
              <path d="M5.6 9a7 7 0 0 1 11.6-2L20 12" />
              <path d="M4 12l2.8 5a7 7 0 0 0 11.6-2" />
            </svg>

            {loading || statusesLoading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>

        <div className="flex flex-col gap-2 border-b border-[#E8EDF3] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <label
            htmlFor="order-fulfillment-status"
            className="text-sm font-medium text-gray-600"
          >
            Lọc tình trạng:
          </label>

          <select
            id="order-fulfillment-status"
            value={fulfillmentStatus}
            onChange={(event) => handleStatusChange(event.target.value)}
            disabled={loading || statusesLoading}
            className="min-h-10 w-full rounded-xl border border-[#D8E1EB] bg-white px-3 py-2 text-sm text-[#12335B] outline-none focus:border-[#18A8DC] focus:ring-4 focus:ring-[#18A8DC]/10 disabled:opacity-50 sm:w-64"
          >
            <option value="">Tất cả tình trạng</option>

            {fulfillmentStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {statusesLoading && (
            <span className="text-xs text-gray-400">
              Đang tải tình trạng...
            </span>
          )}
        </div>

        {statusesError && (
          <div
            role="alert"
            className="mx-5 mt-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700"
          >
            <p className="font-semibold">Không thể tải danh sách tình trạng</p>

            <p className="mt-1">{statusesError}</p>

            <button
              type="button"
              onClick={refresh}
              className="mt-2 font-semibold underline underline-offset-2"
            >
              Thử tải lại
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="m-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            <p className="font-semibold">Không thể tải danh sách đơn hàng</p>

            <p className="mt-1">{error}</p>

            <button
              type="button"
              onClick={refresh}
              className="mt-2 font-semibold underline underline-offset-2"
            >
              Thử lại
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-[#F8FAFC] text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th
                  scope="col"
                  className="whitespace-nowrap px-5 py-4 font-semibold"
                >
                  Ngày đặt
                </th>

                <th
                  scope="col"
                  className="whitespace-nowrap px-5 py-4 font-semibold"
                >
                  Họ tên
                </th>

                <th
                  scope="col"
                  className="whitespace-nowrap px-5 py-4 font-semibold"
                >
                  SĐT đăng ký
                </th>

                <th scope="col" className="min-w-56 px-5 py-4 font-semibold">
                  Địa chỉ nhận
                </th>

                <th
                  scope="col"
                  className="whitespace-nowrap px-5 py-4 font-semibold"
                >
                  Trạng thái
                </th>

                <th
                  scope="col"
                  className="whitespace-nowrap px-5 py-4 font-semibold"
                >
                  Tình trạng
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#EDF1F5]">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#D8E1EB] border-t-[#18A8DC]" />

                      <p className="mt-3 text-sm text-gray-500">
                        Đang tải danh sách đơn hàng...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F8FD] text-[#18A8DC]">
                        <svg
                          viewBox="0 0 24 24"
                          className="h-7 w-7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M6 7h12l1 13H5L6 7Z" />
                          <path d="M9 9V6a3 3 0 0 1 6 0v3" />
                        </svg>
                      </div>

                      <p className="mt-4 font-semibold text-[#12335B]">
                        Chưa có dữ liệu đơn hàng
                      </p>

                      <p className="mt-1 text-sm leading-6 text-gray-500">
                        Không tìm thấy đơn hàng phù hợp với điều kiện lọc.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.rowNumber}
                    className="transition hover:bg-[#F8FAFC]"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                      {formatDate(order.orderDate)}
                    </td>

                    <td className="px-5 py-4 font-semibold text-[#12335B]">
                      {order.receiverName || "—"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                      {order.registrationPhone || "—"}
                    </td>

                    <td className="max-w-xs px-5 py-4 leading-5 text-gray-600">
                      <span className="line-clamp-2">
                        {order.shippingAddress || "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge value={order.orderStatus} />
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge value={order.fulfillmentStatus} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#E8EDF3] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Hiển thị</span>

            <select
              value={pagination.pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              disabled={loading}
              aria-label="Số đơn hàng mỗi trang"
              className="rounded-lg border border-[#D8E1EB] bg-white px-2 py-1.5 text-sm text-[#12335B] outline-none focus:border-[#18A8DC] disabled:opacity-50"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

            <span>đơn mỗi trang</span>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className="text-sm text-gray-500">
              Trang {pagination.page} / {Math.max(1, pagination.totalPages)}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage(pagination.page - 1)}
                disabled={loading || pagination.page <= 1}
                className="rounded-lg border border-[#D8E1EB] px-3 py-2 text-sm font-semibold text-[#12335B] transition hover:bg-[#F3FBFE] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Trước
              </button>

              <button
                type="button"
                onClick={() => setPage(pagination.page + 1)}
                disabled={
                  loading ||
                  pagination.page >= pagination.totalPages ||
                  pagination.totalPages === 0
                }
                className="rounded-lg border border-[#D8E1EB] px-3 py-2 text-sm font-semibold text-[#12335B] transition hover:bg-[#F3FBFE] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
