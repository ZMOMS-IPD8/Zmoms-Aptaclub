"use client";

import { isTrue } from "@/lib/dashboard/logic";
import type { CoDataLead } from "../types";

function getValue(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);

  if (value && typeof value === "object" && "value" in value) {
    return String((value as { value?: unknown }).value ?? "").trim();
  }

  return "";
}

function display(value: unknown): string {
  return getValue(value) || "—";
}

function formatDateOnly(value: unknown): string {
  const normalized = getValue(value);

  if (!normalized) return "—";

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

export default function CoDataTable({
  entries,
  total,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onSelect,
}: {
  entries: CoDataLead[];
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSelect: (entry: CoDataLead) => void;
}) {
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Danh sách Co-Data
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {total.toLocaleString("vi-VN")} hội viên phù hợp
            </p>
          </div>

          {total > 0 && (
            <span className="text-xs text-slate-400">
              {start}–{end}
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1150px] table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[220px]" />
            <col className="w-[150px]" />
            <col className="w-[150px]" />
            <col className="w-[290px]" />
            <col className="w-[125px]" />
            <col className="w-[180px]" />
            <col className="w-[190px]" />
          </colgroup>

          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200">
              <th className="px-5 py-3 font-semibold text-slate-600">
                Hội viên
              </th>

              <th className="px-5 py-3 font-semibold text-slate-600">
                Số điện thoại
              </th>

              <th className="px-5 py-3 font-semibold text-slate-600">
                Tỉnh / thành
              </th>

              <th className="px-5 py-3 font-semibold text-slate-600">
                Nguồn đăng ký
              </th>

              <th className="px-5 py-3 font-semibold text-slate-600">
                Consent
              </th>

              <th className="px-5 py-3 font-semibold text-slate-600">
                Tình trạng mẹ
              </th>

              <th className="px-5 py-3 font-semibold text-slate-600">
                Dự sinh / sinh bé
              </th>
            </tr>
          </thead>

          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-sm text-slate-400"
                >
                  Không có dữ liệu phù hợp.
                </td>
              </tr>
            ) : (
              entries.map((entry, index) => {
                const name = getValue(entry.ho_va_ten_lien_he);

                const phone =
                  getValue(entry.so_dien_thoai_dang_ky) ||
                  getValue(entry.phone_number);

                const consentValue = isTrue(entry.chia_se_de_dang_ky_aptaclub);

                const babyDate = formatDateOnly(
                  entry.ngay_du_sinh_hoac_ngay_sinh_cua_be,
                );

                const province = display(entry.thanh_pho);
                const source = display(entry.nguon_dang_ky);
                const motherStatus = display(entry.tinh_trang_me);

                return (
                  <tr
                    key={getValue(entry.id) || `${phone}-${index}`}
                    onClick={() => onSelect(entry)}
                    className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 align-top">
                      <div
                        className="truncate font-medium text-slate-900"
                        title={name || "—"}
                      >
                        {name || "—"}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 align-top text-slate-600">
                      {phone || "—"}
                    </td>

                    <td
                      className="truncate px-5 py-4 align-top text-slate-600"
                      title={province}
                    >
                      {province}
                    </td>

                    <td
                      className="px-5 py-4 align-top text-slate-600"
                      title={source}
                    >
                      <div className="truncate">{source}</div>
                    </td>

                    <td className="px-5 py-4 align-top">
                      {consentValue ? (
                        <span className="inline-flex whitespace-nowrap rounded-lg bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                          Đã đồng ý
                        </span>
                      ) : (
                        <span className="inline-flex whitespace-nowrap rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                          Chưa đồng ý
                        </span>
                      )}
                    </td>

                    <td
                      className="px-5 py-4 align-top text-slate-600"
                      title={motherStatus}
                    >
                      <div className="truncate">{motherStatus}</div>
                    </td>

                    <td
                      className="whitespace-nowrap px-5 py-4 align-top text-slate-600"
                      title={babyDate}
                    >
                      {babyDate}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          <p className="text-xs text-slate-500">
            Trang {currentPage} / {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Trang trước"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Trước
            </button>

            <button
              type="button"
              aria-label="Trang sau"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
