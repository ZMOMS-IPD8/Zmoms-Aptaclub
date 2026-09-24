"use client";

import type { DashboardBabyCare } from "../../types/dashboard";

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

export default function CoLeadTable({
  babyCare,
  onSelect,
}: {
  babyCare: DashboardBabyCare[];
  onSelect: (item: DashboardBabyCare) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-base font-semibold text-slate-900">
          Danh sách Co-Lead
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          {babyCare.length.toLocaleString("vi-VN")} hội viên phù hợp
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[220px]" />
            <col className="w-[160px]" />
            <col className="w-[160px]" />
            <col className="w-[170px]" />
            <col className="w-[180px]" />
            <col className="w-[250px]" />
          </colgroup>

          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200">
              <th className="px-5 py-3 font-semibold text-slate-600">Họ tên</th>

              <th className="px-5 py-3 font-semibold text-slate-600">
                Số điện thoại
              </th>

              <th className="px-5 py-3 font-semibold text-slate-600">
                Đăng ký tắm bé
              </th>

              <th className="px-5 py-3 font-semibold text-slate-600">
                Thời gian tắm bé
              </th>

              <th className="px-5 py-3 font-semibold text-slate-600">
                Trạng thái
              </th>

              <th className="px-5 py-3 font-semibold text-slate-600">
                Địa chỉ
              </th>
            </tr>
          </thead>

          <tbody>
            {babyCare.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-sm text-slate-400"
                >
                  Không có dữ liệu phù hợp.
                </td>
              </tr>
            ) : (
              babyCare.map((item) => {
                const completed = Boolean(item.staff);
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
                      title={item.serviceTime || "—"}
                    >
                      {formatDateOnly(item.serviceTime)}
                    </td>

                    <td className="px-5 py-4 align-top">
                      {completed ? (
                        <span className="inline-flex whitespace-nowrap rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          Đã hoàn thành
                        </span>
                      ) : (
                        <span className="inline-flex whitespace-nowrap rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                          Chưa hoàn thành
                        </span>
                      )}
                    </td>

                    <td
                      className="px-5 py-4 align-top text-slate-600"
                      title={item.address || "—"}
                    >
                      <div className="truncate">{item.address || "—"}</div>
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
