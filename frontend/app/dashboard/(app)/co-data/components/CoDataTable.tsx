import type { CoDataLead } from "../types";
import { formatDate } from "../../utils/format";

function getValue(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object" && "value" in value) {
    return String((value as { value?: unknown }).value ?? "").trim();
  }
  return "";
}

function display(value: unknown) {
  return getValue(value) || "—";
}

export default function CoDataTable({
  entries,
  total,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
}: {
  entries: CoDataLead[];
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
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
        <table className="w-full min-w-[1200px] text-left text-sm">
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
                Mã giới thiệu
              </th>
              <th className="px-5 py-3 font-semibold text-slate-600">
                Tình trạng mẹ
              </th>
              <th className="px-5 py-3 font-semibold text-slate-600">
                Ngày đăng ký
              </th>
              <th className="px-5 py-3 font-semibold text-slate-600">E-Book</th>
            </tr>
          </thead>

          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-sm text-slate-400"
                >
                  Không có dữ liệu phù hợp.
                </td>
              </tr>
            ) : (
              entries.map((entry, index) => {
                const name =
                  getValue(entry.ho_va_ten_lien_he) || getValue(entry.name);

                const phone =
                  getValue(entry.so_dien_thoai_dang_ky) ||
                  getValue(entry.phone_number);

                const ebook = getValue(entry.email_nhan_ebook);

                return (
                  <tr
                    key={getValue(entry.id) || `${phone}-${index}`}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        {name || "—"}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600">{phone || "—"}</td>

                    <td className="px-5 py-4 text-slate-600">
                      {display(entry.thanh_pho)}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {display(entry.nguon_dang_ky)}
                    </td>

                    <td className="px-5 py-4">
                      {getValue(entry.ma_gioi_thieu_dang_ky) ? (
                        <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#173B8F]">
                          {getValue(entry.ma_gioi_thieu_dang_ky)}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {display(entry.tinh_trang_me)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {formatDate(getValue(entry.thoi_gian_dang_ky))}
                    </td>

                    <td className="px-5 py-4">
                      {ebook ? (
                        <span className="rounded-lg bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                          Đã nhận
                        </span>
                      ) : (
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                          Chưa nhận
                        </span>
                      )}
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
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Trước
            </button>

            <button
              type="button"
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
