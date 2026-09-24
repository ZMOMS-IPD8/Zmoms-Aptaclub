"use client";

import type { DashboardOrder } from "../../types/dashboard";

function formatDate(value: string): string {
  const normalized = value?.trim();

  if (!normalized) {
    return "—";
  }

  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return normalized;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function CoSellTable({
  orders,
  onSelect,
}: {
  orders: DashboardOrder[];
  onSelect: (item: DashboardOrder) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-base font-semibold text-slate-900">
          Danh sách Co-Sell
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          {orders.length.toLocaleString("vi-VN")} đơn hàng phù hợp
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1400px] table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[210px]" />
            <col className="w-[150px]" />
            <col className="w-[150px]" />
            <col className="w-[190px]" />
            <col className="w-[130px]" />
            <col className="w-[150px]" />
            <col className="w-[190px]" />
            <col className="w-[180px]" />
            <col className="w-[180px]" />
          </colgroup>

          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200">
              <th className="px-5 py-3 font-semibold text-slate-600">
                Khách hàng
              </th>

              <th className="px-5 py-3 font-semibold text-slate-600">Mã đơn</th>

              <th className="px-5 py-3 font-semibold text-slate-600">Combo</th>

              <th className="px-5 py-3 font-semibold text-slate-600">
                Ngày đặt
              </th>

              <th className="px-5 py-3 font-semibold text-slate-600">
                Giá trị
              </th>

              <th className="px-5 py-3 font-semibold text-slate-600">
                Thanh toán
              </th>

              <th className="px-5 py-3 font-semibold text-slate-600">
                Giao hàng
              </th>

              <th className="px-5 py-3 font-semibold text-slate-600">
                Ngày giao thành công
              </th>

              <th className="px-5 py-3 font-semibold text-slate-600">Seller</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-12 text-center text-sm text-slate-400"
                >
                  Không có dữ liệu phù hợp.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => onSelect(order)}
                  className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-5 py-4 align-top">
                    <div
                      className="truncate font-medium text-slate-900"
                      title={order.name || "—"}
                    >
                      {order.name || "—"}
                    </div>

                    <div className="mt-1 text-xs text-slate-400">
                      {order.phone || "—"}
                    </div>
                  </td>

                  <td className="px-5 py-4 align-top font-medium text-slate-700">
                    {order.orderCode || "—"}
                  </td>

                  <td
                    className="truncate px-5 py-4 align-top text-slate-600"
                    title={order.combo || "—"}
                  >
                    {order.combo || "—"}
                  </td>

                  <td className="px-5 py-4 align-top text-slate-600">
                    {formatDate(order.orderDate)}
                  </td>

                  <td className="px-5 py-4 align-top font-semibold text-slate-900">
                    {order.amount.toLocaleString("vi-VN")} ₫
                  </td>

                  <td className="px-5 py-4 align-top">
                    <span className="inline-flex whitespace-nowrap rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {order.paymentStatus || "—"}
                    </span>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <span className="inline-flex whitespace-nowrap rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {order.deliveryStatus || "—"}
                    </span>
                  </td>

                  <td className="px-5 py-4 align-top text-slate-600">
                    {formatDate(order.deliveredDate)}
                  </td>

                  <td className="px-5 py-4 align-top text-slate-600">
                    {order.sellerCode || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
