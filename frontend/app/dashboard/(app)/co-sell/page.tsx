"use client";

import { useEffect, useState } from "react";
import type { DashboardApiResponse, DashboardData } from "../types/dashboard";

export default function CoSellPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/data", { cache: "no-store" })
      .then((response) => response.json())
      .then((result: DashboardApiResponse<DashboardData>) => {
        if (result.success) {
          setData(result.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-sm text-slate-500">Đang tải dữ liệu...</div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-sm text-red-500">Không tải được dữ liệu.</div>
    );
  }

  const orders = data.orders;

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Co-Sell</h1>
        <p className="mt-1 text-sm text-slate-500">
          Theo dõi đơn hàng, thanh toán và doanh thu.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi title="Tổng đơn" value={orders.total} />
        <Kpi title="Đã thanh toán" value={orders.paid} />
        <Kpi title="Chưa thanh toán" value={orders.unpaid} />
        <Kpi
          title="Doanh thu"
          value={`${orders.revenue.toLocaleString("vi-VN")} ₫`}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Breakdown title="Theo combo" data={data.stats.ordersByCombo} />
        <Breakdown
          title="Trạng thái thanh toán"
          data={data.stats.paymentStatus}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-900">
            Danh sách đơn hàng
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1300px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Mã đơn</th>
                <th className="px-6 py-4">Combo</th>
                <th className="px-6 py-4">Ngày đặt</th>
                <th className="px-6 py-4">Seller</th>
                <th className="px-6 py-4">Giá trị</th>
                <th className="px-6 py-4">Thanh toán</th>
                <th className="px-6 py-4">Giao hàng</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {orders.orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">
                      {order.name || "—"}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      {order.phone || "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">
                    {order.orderCode || "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {order.combo || "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {order.orderDate || "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {order.sellerCode || "—"}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {order.amount.toLocaleString("vi-VN")} ₫
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {order.paymentStatus || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {order.deliveryStatus || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">
        {typeof value === "number" ? value.toLocaleString("vi-VN") : value}
      </p>
    </div>
  );
}

function Breakdown({
  title,
  data,
}: {
  title: string;
  data: Record<string, number>;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>

      <div className="mt-5 space-y-3">
        {Object.entries(data)
          .sort(([, a], [, b]) => b - a)
          .map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-slate-600">{label}</span>
              <span className="font-semibold text-slate-900">{value}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
