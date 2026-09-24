"use client";

import { useEffect, useState } from "react";
import type { DashboardApiResponse, DashboardData } from "../types/dashboard";

export default function LeadsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const filteredLeads = data.leads.entries.filter((lead) => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return true;
    }

    return (
      String(lead.name ?? "")
        .toLowerCase()
        .includes(keyword) ||
      String(lead.phone_number ?? "")
        .toLowerCase()
        .includes(keyword) ||
      String(lead.so_dien_thoai_dang_ky ?? "")
        .toLowerCase()
        .includes(keyword)
    );
  });

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Lead</h1>
        <p className="mt-1 text-sm text-slate-500">
          Danh sách Lead chưa chuyển sang Co-Data.
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Tổng Lead</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {data.leads.total_entries.toLocaleString("vi-VN")}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Kết quả hiển thị</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {filteredLeads.length.toLocaleString("vi-VN")}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Danh sách Lead
          </h2>

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm tên hoặc số điện thoại..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#173B8F] focus:bg-white md:w-[320px]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Tên Zalo</th>
                <th className="px-6 py-4">Số điện thoại</th>
                <th className="px-6 py-4">ID</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead, index) => (
                <tr
                  key={String(lead.id ?? index)}
                  className="hover:bg-slate-50"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {String(lead.name ?? "—")}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {String(
                      lead.so_dien_thoai_dang_ky || lead.phone_number || "—",
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {String(lead.id ?? "—")}
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
