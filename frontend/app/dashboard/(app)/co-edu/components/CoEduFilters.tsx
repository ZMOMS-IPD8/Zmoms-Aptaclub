"use client";

import type { CoEduFilters as CoEduFiltersState } from "../types";

export default function CoEduFilters({
  filters,
  total,
  filteredTotal,
  onChange,
  onReset,
}: {
  filters: CoEduFiltersState;
  total: number;
  filteredTotal: number;
  onChange: (filters: CoEduFiltersState) => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px_auto]">
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
            placeholder="Họ tên hoặc số điện thoại..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#173B8F]"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Trạng thái tham dự
          </label>

          <select
            value={filters.status}
            onChange={(event) =>
              onChange({
                ...filters,
                status: event.target.value as CoEduFiltersState["status"],
              })
            }
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#173B8F]"
          >
            <option value="all">Tất cả</option>
            <option value="attended">Đã tham dự</option>
            <option value="pending">Chưa tham dự</option>
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
          {total.toLocaleString("vi-VN")} hội viên
        </span>

        <span>Đã tham dự = đã có đánh giá sau buổi tư vấn</span>
      </div>
    </div>
  );
}
