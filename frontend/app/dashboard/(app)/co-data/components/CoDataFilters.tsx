"use client";

import { RotateCcw, Search } from "lucide-react";

type CoDataFiltersProps = {
  search: string;
  province: string;
  source: string;
  motherStatus: string;
  consent: string;
  provinces: string[];
  sources: string[];
  motherStatuses: string[];
  onSearchChange: (value: string) => void;
  onProvinceChange: (value: string) => void;
  onSourceChange: (value: string) => void;
  onMotherStatusChange: (value: string) => void;
  onConsentChange: (value: string) => void;
  onReset: () => void;
};

export default function CoDataFilters({
  search,
  province,
  source,
  motherStatus,
  consent,
  provinces,
  sources,
  motherStatuses,
  onSearchChange,
  onProvinceChange,
  onSourceChange,
  onMotherStatusChange,
  onConsentChange,
  onReset,
}: CoDataFiltersProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="grid gap-3 lg:grid-cols-[minmax(240px,1.5fr)_repeat(4,minmax(140px,1fr))_auto]">
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm tên hoặc số điện thoại..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#173B8F] focus:ring-2 focus:ring-[#173B8F]/10"
          />
        </div>

        <select
          value={province}
          onChange={(event) => onProvinceChange(event.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#173B8F]"
        >
          <option value="all">Tất cả tỉnh / thành</option>

          {provinces.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={source}
          onChange={(event) => onSourceChange(event.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#173B8F]"
        >
          <option value="all">Tất cả nguồn đăng ký</option>

          {sources.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={motherStatus}
          onChange={(event) => onMotherStatusChange(event.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#173B8F]"
        >
          <option value="all">Tất cả tình trạng mẹ</option>

          {motherStatuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={consent}
          onChange={(event) => onConsentChange(event.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#173B8F]"
        >
          <option value="all">Tất cả Consent</option>
          <option value="yes">Đã đồng ý Aptaclub</option>
          <option value="no">Chưa đồng ý Aptaclub</option>
        </select>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <RotateCcw size={16} />
          Xóa lọc
        </button>
      </div>
    </div>
  );
}
