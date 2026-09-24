"use client";

import { useEffect, useState } from "react";
import type { DashboardApiResponse, DashboardData } from "../types/dashboard";

export default function CoEduPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

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

  const consultation = data.consultation;

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Co-Edu</h1>
        <p className="mt-1 text-sm text-slate-500">
          Theo dõi lớp tư vấn, tham dự và khảo sát.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi title="Tổng đăng ký" value={consultation.registered} />
        <Kpi title="Đã tham dự" value={consultation.attended} />
        <Kpi title="Tỷ lệ tham dự" value={`${consultation.attendanceRate}%`} />
        <Kpi title="Pre-survey" value={consultation.preSurveyCompleted} />
        <Kpi title="Post-survey" value={consultation.postSurveyCompleted} />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-900">
            Danh sách Co-Edu
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Họ tên</th>
                <th className="px-6 py-4">Số điện thoại</th>
                <th className="px-6 py-4">Đăng ký</th>
                <th className="px-6 py-4">Tham dự</th>
                <th className="px-6 py-4">Pre-survey</th>
                <th className="px-6 py-4">Post-survey</th>
                <th className="px-6 py-4">Đánh giá</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {consultation.consultations.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {item.name || "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {item.phone || "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {item.registeredAt || "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {item.attendedAt || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <Status value={item.preSurvey} />
                  </td>
                  <td className="px-6 py-4">
                    <Status value={item.postSurvey} />
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {item.postRating || "—"}
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

function Kpi({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">
        {typeof value === "number" ? value.toLocaleString("vi-VN") : value}
      </p>
    </div>
  );
}

function Status({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        value ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
      }`}
    >
      {value ? "Đã hoàn thành" : "Chưa có"}
    </span>
  );
}
