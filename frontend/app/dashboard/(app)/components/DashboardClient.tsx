"use client";

import { useState } from "react";
import BabyCareOverview from "./BabyCareOverview";
import ConsultationOverview from "./ConsultationOverview";
import DashboardHeader from "./DashboardHeader";
import KpiCards from "./KpiCards";
import OrdersOverview from "./OrdersOverview";
import RegistrationOverview from "./RegistrationOverview";
import type { DashboardApiResponse, DashboardData } from "../types/dashboard";

type DashboardClientProps = {
  initialData: DashboardData;
};

async function fetchDashboardData(): Promise<DashboardData> {
  const response = await fetch("/api/dashboard/data", {
    method: "GET",
    cache: "no-store",
  });

  if (response.status === 401) {
    window.location.replace("/dashboard/login");
    throw new Error("Unauthorized");
  }

  const data = (await response.json()) as DashboardApiResponse<DashboardData>;

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Không thể tải dữ liệu Dashboard.");
  }

  return data.data;
}

function SectionHeader({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#173B8F] text-sm font-bold text-white">
        {number}
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>

        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function DashboardLoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/75 backdrop-blur-sm">
      <div className="flex w-[340px] flex-col items-center rounded-2xl bg-white px-7 py-8 text-center shadow-xl">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#173B8F]" />

        <p className="mt-5 text-lg font-semibold text-[#173B8F]">
          Đang cập nhật dữ liệu...
        </p>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Đang đồng bộ dữ liệu mới nhất từ hệ thống.
          <br />
          Vui lòng chờ trong giây lát.
        </p>
      </div>
    </div>
  );
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const [data, setData] = useState<DashboardData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRefresh() {
    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await fetchDashboardData();

      setData(result);
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        return;
      }

      setError(
        error instanceof Error
          ? error.message
          : "Không thể tải dữ liệu Dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }

  const { stats, orders, consultation, babyCare, coSell } = data;

  const { danone, funnel } = stats;

  return (
    <>
      {loading ? <DashboardLoadingOverlay /> : null}

      <main className="min-h-screen bg-[#F2F6FF]">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          <DashboardHeader
            loading={loading}
            onRefresh={() => void handleRefresh()}
          />

          {error ? (
            <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <section>
            <SectionHeader
              number="01"
              title="Danone Performance"
              description="Tổng quan Co-Data, Consent, NU và tỷ lệ chuyển đổi."
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Co-Data</p>

                <p className="mt-2 text-3xl font-bold text-[#173B8F]">
                  {danone.coData.toLocaleString("vi-VN")}
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  Đã hoàn tất đăng ký
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Consent</p>

                <p className="mt-2 text-3xl font-bold text-[#173B8F]">
                  {danone.consent.toLocaleString("vi-VN")}
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  Đồng ý chia sẻ dữ liệu
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-gray-500">
                  Consent Rate
                </p>

                <p className="mt-2 text-3xl font-bold text-[#173B8F]">
                  {danone.consentRate.toFixed(2)}%
                </p>

                <p className="mt-2 text-xs text-gray-500">Consent / Co-Data</p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-gray-500">NU</p>

                <p className="mt-2 text-3xl font-bold text-[#173B8F]">
                  {danone.nu.toLocaleString("vi-VN")}
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  Đã giao hàng thành công
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-gray-500">
                  Co-Data → NU
                </p>

                <p className="mt-2 text-3xl font-bold text-[#173B8F]">
                  {danone.conversionRate.toFixed(2)}%
                </p>

                <p className="mt-2 text-xs text-gray-500">Tỷ lệ chuyển đổi</p>
              </div>
            </div>
          </section>

          <section className="mt-10">
            <SectionHeader
              number="02"
              title="Tổng quan Funnel"
              description="Phân bổ dữ liệu theo từng bước trong hành trình khách hàng."
            />

            <KpiCards
              coData={funnel.coData}
              coEdu={funnel.coEdu}
              coLead={funnel.coLead}
              coSell={funnel.coSell}
            />
          </section>

          <section className="mt-10">
            <SectionHeader
              number="03"
              title="Co-Data"
              description="Tổng quan dữ liệu khách hàng đã hoàn tất đăng ký."
            />

            <RegistrationOverview
              byDate={stats.registrations.byDate}
              byProvince={stats.registrations.byProvince}
              bySource={stats.registrations.bySource}
              byWeek={stats.registrations.byWeek}
              byMonth={stats.registrations.byMonth}
            />
          </section>

          <section className="mt-10">
            <SectionHeader
              number="04"
              title="Co-Edu"
              description="Tổng quan đăng ký và chuyển đổi lớp học."
            />

            <ConsultationOverview
              total={consultation.total}
              registered={consultation.registered}
              attended={consultation.attended}
              attendanceRate={consultation.attendanceRate}
            />
          </section>

          <section className="mt-10">
            <SectionHeader
              number="05"
              title="Co-Lead"
              description="Tổng quan chuyển đổi dịch vụ tắm bé."
            />

            <BabyCareOverview
              total={babyCare.total}
              registered={babyCare.registered}
              completed={babyCare.completed}
              pending={babyCare.pending}
              completionRate={babyCare.completionRate}
            />
          </section>

          <section className="mt-10 pb-10">
            <SectionHeader
              number="06"
              title="Co-Sell"
              description="Tổng quan đơn hàng, giao hàng thành công, doanh thu và Touchpoint."
            />

            <OrdersOverview
              total={orders.total}
              paid={orders.paid}
              unpaid={orders.unpaid}
              delivered={orders.delivered}
              revenue={orders.revenue}
              touchpoints={coSell.touchpoints}
            />
          </section>
        </div>
      </main>
    </>
  );
}
