"use client";

import { useMemo, useState } from "react";

import type { DashboardOrder } from "../../types/dashboard";
import { transformDashboardData } from "@/lib/dashboard/transform";
import { useDashboardSession } from "../../components/DashboardSessionProvider";

import CoSellDetail from "./CoSellDetail";
import CoSellFilters from "./CoSellFilters";
import CoSellStats from "./CoSellStats";
import CoSellTable from "./CoSellTable";

import type { CoSellFilters as CoSellFiltersState } from "../types";

const DEFAULT_FILTERS: CoSellFiltersState = {
  search: "",
  paymentStatus: "all",
};

export default function CoSellClient() {
  const { storage, loading } = useDashboardSession();

  const [filters, setFilters] = useState<CoSellFiltersState>(DEFAULT_FILTERS);

  const [selectedItem, setSelectedItem] = useState<DashboardOrder | null>(null);

  const data = useMemo(() => {
    if (!storage) {
      return null;
    }

    return transformDashboardData(storage.entries, storage.totalEntries);
  }, [storage]);

  const orders = data?.orders;

  const filteredOrders = useMemo(() => {
    if (!orders) {
      return [];
    }

    const search = filters.search.trim().toLowerCase();

    return orders.orders.filter((order) => {
      const name = order.name?.toLowerCase() || "";
      const phone = order.phone?.toLowerCase() || "";
      const orderCode = order.orderCode?.toLowerCase() || "";

      const matchesSearch =
        !search ||
        name.includes(search) ||
        phone.includes(search) ||
        orderCode.includes(search);

      const paid = order.paymentStatus.trim() !== "";

      const matchesPayment =
        filters.paymentStatus === "all" ||
        (filters.paymentStatus === "paid" && paid) ||
        (filters.paymentStatus === "unpaid" && !paid);

      return matchesSearch && matchesPayment;
    });
  }, [orders, filters.search, filters.paymentStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F6FF] p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <p className="text-sm font-medium text-slate-700">
              Đang tải dữ liệu...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!storage || !data || !orders) {
    return (
      <div className="min-h-screen bg-[#F2F6FF] p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <p className="text-sm font-medium text-slate-700">
              Chưa có dữ liệu Co-Sell.
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Vui lòng đồng bộ dữ liệu từ Dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#F2F6FF] p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173B8F] text-sm font-bold text-white">
                06
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">Co-Sell</h1>

                <p className="mt-1 text-sm text-slate-500">
                  Theo dõi khách hàng đã phát sinh đơn hàng và trạng thái giao
                  hàng.
                </p>
              </div>
            </div>
          </div>

          <CoSellStats orders={orders} />

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <Breakdown title="Theo combo" data={data.stats.ordersByCombo} />

            <Breakdown title="Theo Touchpoint" data={data.coSell.touchpoints} />

            <Breakdown
              title="Trạng thái thanh toán"
              data={data.stats.paymentStatus}
            />
          </div>

          <div className="mt-6">
            <CoSellFilters
              filters={filters}
              total={orders.total}
              filteredTotal={filteredOrders.length}
              onChange={setFilters}
              onReset={() => setFilters(DEFAULT_FILTERS)}
            />
          </div>

          <div className="mt-6">
            <CoSellTable orders={filteredOrders} onSelect={setSelectedItem} />
          </div>
        </div>
      </main>

      {selectedItem ? (
        <CoSellDetail
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      ) : null}
    </>
  );
}

function Breakdown({
  title,
  data,
}: {
  title: string;
  data: Record<string, number>;
}) {
  const entries = Object.entries(data).sort(([, a], [, b]) => b - a);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>

      <div className="mt-5 space-y-3">
        {entries.length === 0 ? (
          <p className="text-sm text-slate-400">Chưa có dữ liệu.</p>
        ) : (
          entries.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <span className="truncate text-slate-600" title={label}>
                {label || "—"}
              </span>

              <span className="shrink-0 font-semibold text-slate-900">
                {value.toLocaleString("vi-VN")}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
