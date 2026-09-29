"use client";

import { useMemo } from "react";

import { transformDashboardData } from "@/lib/dashboard/transform";
import { useDashboardSession } from "./DashboardSessionProvider";
import BabyCareOverview from "./BabyCareOverview";
import ConsultationOverview from "./ConsultationOverview";
import DashboardHeader from "./DashboardHeader";
import KpiCards from "./KpiCards";
import OrdersOverview from "./OrdersOverview";
import RegistrationOverview from "./RegistrationOverview";

type DashboardData = ReturnType<typeof transformDashboardData>;

function getTodayDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatDate(value: string): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return value;
  }

  return `${match[3]}/${match[2]}/${match[1]}`;
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

function EmptyDashboard() {
  return (
    <main className="min-h-screen bg-[#F2F6FF]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF3FF] text-[#173B8F]">
            <span className="text-2xl">↻</span>
          </div>

          <h1 className="mt-5 text-xl font-bold text-gray-900">
            Chưa có dữ liệu Dashboard
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Chưa có dữ liệu được lưu cho phiên đăng nhập này. Vui lòng sử dụng
            nút Đồng bộ dữ liệu ở thanh bên để cập nhật dữ liệu.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function DashboardClient() {
  const { storage, loading: sessionLoading } = useDashboardSession();

  const data = useMemo<DashboardData | null>(() => {
    if (!storage) {
      return null;
    }

    return transformDashboardData(storage.entries, storage.totalEntries);
  }, [storage]);

  const registrationOverview = useMemo(() => {
    const today = getTodayDate();

    return {
      today: {
        date: today,
        total: data?.stats.registrations.today.total ?? 0,
        byProvince: data?.stats.registrations.today.byProvince ?? {},
        bySource: data?.stats.registrations.today.bySource ?? {},
      },
      total: {
        total: data?.stats.danone.coData ?? 0,
        byProvince: data?.stats.registrations.byProvince ?? {},
        bySource: data?.stats.registrations.bySource ?? {},
      },
    };
  }, [data]);

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F2F6FF]">
        <div className="text-sm text-gray-500">
          Đang kiểm tra phiên đăng nhập...
        </div>
      </div>
    );
  }

  if (!data) {
    return <EmptyDashboard />;
  }

  const { stats, consultation, babyCare } = data;

  const { funnel, danone } = stats;

  return (
    <main className="min-h-screen bg-[#F2F6FF]">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <DashboardHeader />

        <section>
          <SectionHeader
            number="01"
            title="Danone Performance"
            description="Tổng quan Consent, NU và tỷ lệ chuyển đổi."
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <p className="text-sm font-medium text-gray-500">Consent Rate</p>

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
              <p className="text-sm font-medium text-gray-500">Co-Data → NU</p>

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
            description="Tổng quan dữ liệu đăng ký hôm nay và toàn bộ dữ liệu."
          />

          <RegistrationOverview
            today={registrationOverview.today}
            total={registrationOverview.total}
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
            description="Tổng quan đơn hàng hoàn thành và các kênh chuyển đổi."
          />

          <OrdersOverview
            total={data.coSell.total}
            touchpoints={data.coSell.touchpoints}
          />
        </section>
      </div>
    </main>
  );
}
