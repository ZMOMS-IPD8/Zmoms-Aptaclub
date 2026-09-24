"use client";

import type { CoSellFilters as CoSellFiltersState } from "../types";

export default function CoSellFilters({
  filters,
  total,
  filteredTotal,
  onChange,
  onReset,
}: {
  filters: CoSellFiltersState;
  total: number;
  filteredTotal: number;
  onChange: (filters: CoSellFiltersState) => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Tìm kiếm
          </label>

          <input
            type="text"
            value={filters.search}
            onChange={(event) =>
              onChange({
                ...filters,
                search: event.target.value,
              })
            }
            placeholder="Tên, số điện thoại hoặc mã đơn..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#173B8F]"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Thanh toán
          </label>

          <select
            value={filters.paymentStatus}
            onChange={(event) =>
              onChange({
                ...filters,
                paymentStatus: event.target
                  .value as CoSellFiltersState["paymentStatus"],
              })
            }
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#173B8F]"
          >
            <option value="all">Tất cả</option>
            <option value="paid">Đã thanh toán</option>
            <option value="unpaid">Chưa thanh toán</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Giao hàng
          </label>

          <select
            value={filters.deliveryStatus}
            onChange={(event) =>
              onChange({
                ...filters,
                deliveryStatus: event.target
                  .value as CoSellFiltersState["deliveryStatus"],
              })
            }
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#173B8F]"
          >
            <option value="all">Tất cả</option>
            <option value="delivered">Đã giao thành công</option>
            <option value="pending">Chưa giao thành công</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onReset}
            className="h-10 w-full rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 lg:w-auto"
          >
            Xóa lọc
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <span>
          {filteredTotal.toLocaleString("vi-VN")} /{" "}
          {total.toLocaleString("vi-VN")} đơn hàng
        </span>

        <span>Co-Sell = đã giao hàng thành công</span>
      </div>
    </div>
  );
}
