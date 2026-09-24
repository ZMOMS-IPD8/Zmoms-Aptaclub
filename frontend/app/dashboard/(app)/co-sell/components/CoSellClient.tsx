"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  DashboardApiResponse,
  DashboardData,
  DashboardOrder,
} from "../../types/dashboard";
import CoSellDetail from "./CoSellDetail";
import CoSellFilters from "./CoSellFilters";
import CoSellStats from "./CoSellStats";
import CoSellTable from "./CoSellTable";
import type { CoSellFilters as CoSellFiltersState } from "../types";

const DEFAULT_FILTERS: CoSellFiltersState = {
  search: "",
  paymentStatus: "all",
  deliveryStatus: "all",
};

export default function CoSellClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<CoSellFiltersState>(DEFAULT_FILTERS);
  const [selectedItem, setSelectedItem] = useState<DashboardOrder | null>(null);

  useEffect(() => {
    let mounted = true;

    fetch("/api/dashboard/data", {
      cache: "no-store",
    })
      .then(async (response) => {
        if (response.status === 401) {
          window.location.replace("/dashboard/login");
          throw new Error("Unauthorized");
        }

        const result =
          (await response.json()) as DashboardApiResponse<DashboardData>;

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Không thể tải dữ liệu Co-Sell.");
        }

        return result.data;
      })
      .then((result) => {
        if (mounted) {
          setData(result);
        }
      })
      .catch((error: unknown) => {
        if (!mounted) {
          return;
        }

        if (error instanceof Error && error.message === "Unauthorized") {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Không thể tải dữ liệu Co-Sell.",
        );
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

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

      const delivered = order.deliveredDate.trim() !== "";

      const matchesPayment =
        filters.paymentStatus === "all" ||
        (filters.paymentStatus === "paid" && paid) ||
        (filters.paymentStatus === "unpaid" && !paid);

      const matchesDelivery =
        filters.deliveryStatus === "all" ||
        (filters.deliveryStatus === "delivered" && delivered) ||
        (filters.deliveryStatus === "pending" && !delivered);

      return matchesSearch && matchesPayment && matchesDelivery;
    });
  }, [orders, filters.search, filters.paymentStatus, filters.deliveryStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F6FF] p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
            Đang tải dữ liệu Co-Sell...
          </div>
        </div>
      </div>
    );
  }

  if (error || !data || !orders) {
    return (
      <div className="min-h-screen bg-[#F2F6FF] p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
            {error || "Không tải được dữ liệu Co-Sell."}
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
                  Theo dõi khách hàng đã phát sinh đơn hàng và giao hàng thành
                  công.
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
