"use client";

import type { DashboardConsultation } from "../../types/dashboard";

function formatDateOnly(value: string): string {
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

export default function CoEduTable({
  consultations,
  onSelect,
}: {
  consultations: DashboardConsultation[];
  onSelect: (item: DashboardConsultation) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-base font-semibold text-slate-900">
          Danh sách Co-Edu
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          {consultations.length.toLocaleString("vi-VN")} hội viên phù hợp
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1400px] table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[220px]" />
            <col className="w-[160px]" />
            <col className="w-[150px]" />
            <col className="w-[150px]" />
            <col className="w-[180px]" />
            <col className="w-[220px]" />
            <col className="w-[220px]" />
            <col className="w-[220px]" />
          </colgroup>

          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200">
              <th className="px-5 py-3 font-semibold text-slate-600">Họ tên</th>

              <th className="px-5 py-3 font-semibold text-slate-600">
                Số điện thoại
              </th>

              <th className="px-5 py-3 font-semibold text-slate-600">
                Đăng ký lớp
              </th>

              <th className="px-5 py-3 font-semibold text-slate-600">
                Ngày tham dự
              </th>

              <th className="px-5 py-3 font-semibold text-slate-600">
                Trạng thái
              </th>

              <th className="px-5 py-3 font-semibold text-slate-600">
                Đánh giá
              </th>

              <th className="px-5 py-3 font-semibold text-slate-600">
                Nhu cầu hỗ trợ
              </th>

              <th className="px-5 py-3 font-semibold text-slate-600">
                Ưu tiên phát triển bé
              </th>
            </tr>
          </thead>

          <tbody>
            {consultations.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-sm text-slate-400"
                >
                  Không có dữ liệu phù hợp.
                </td>
              </tr>
            ) : (
              consultations.map((item) => {
                const attended = item.postRating.trim() !== "";

                const name = item.name || "—";
                const phone = item.phone || "—";

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 align-top">
                      <div
                        className="truncate font-medium text-slate-900"
                        title={name}
                      >
                        {name}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 align-top text-slate-600">
                      {phone}
                    </td>

                    <td
                      className="whitespace-nowrap px-5 py-4 align-top text-slate-600"
                      title={item.registeredAt || "—"}
                    >
                      {formatDateOnly(item.registeredAt)}
                    </td>

                    <td
                      className="whitespace-nowrap px-5 py-4 align-top text-slate-600"
                      title={item.attendedAt || "—"}
                    >
                      {formatDateOnly(item.attendedAt)}
                    </td>

                    <td className="px-5 py-4 align-top">
                      {attended ? (
                        <span className="inline-flex whitespace-nowrap rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          Đã tham dự
                        </span>
                      ) : (
                        <span className="inline-flex whitespace-nowrap rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                          Chưa tham dự
                        </span>
                      )}
                    </td>

                    <td
                      className="truncate px-5 py-4 align-top text-slate-600"
                      title={item.postRating || "—"}
                    >
                      {item.postRating || "—"}
                    </td>

                    <td
                      className="px-5 py-4 align-top text-slate-600"
                      title={item.supportNeed || "—"}
                    >
                      <div className="truncate">{item.supportNeed || "—"}</div>
                    </td>

                    <td
                      className="px-5 py-4 align-top text-slate-600"
                      title={item.developmentPriority || "—"}
                    >
                      <div className="truncate">
                        {item.developmentPriority || "—"}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
