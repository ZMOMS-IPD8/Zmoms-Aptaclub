"use client";

import { useMemo, useState } from "react";

import { transformDashboardData } from "@/lib/dashboard/transform";
import { useDashboardSession } from "../../components/DashboardSessionProvider";

import type {
  DashboardConsultation,
  DashboardConsultationData,
} from "../../types/dashboard";

import CoEduDetail from "./CoEduDetail";
import CoEduFilters from "./CoEduFilters";
import CoEduStats from "./CoEduStats";
import CoEduTable from "./CoEduTable";
import type { CoEduFilters as CoEduFiltersState } from "../types";

const DEFAULT_FILTERS: CoEduFiltersState = {
  search: "",
  status: "all",
};

function hasPostRating(item: DashboardConsultation): boolean {
  return item.postRating.trim() !== "";
}

export default function CoEduClient() {
  const { storage, loading } = useDashboardSession();

  const [filters, setFilters] = useState<CoEduFiltersState>(DEFAULT_FILTERS);

  const [selectedItem, setSelectedItem] =
    useState<DashboardConsultation | null>(null);

  const consultation = useMemo<DashboardConsultationData | null>(() => {
    if (!storage) {
      return null;
    }

    const data = transformDashboardData(storage.entries, storage.totalEntries);

    return data.consultation;
  }, [storage]);

  const filteredConsultations = useMemo(() => {
    if (!consultation) {
      return [];
    }

    const search = filters.search.trim().toLowerCase();

    return consultation.consultations.filter((item) => {
      const name = item.name?.toLowerCase() || "";
      const phone = item.phone?.toLowerCase() || "";

      const matchesSearch =
        !search || name.includes(search) || phone.includes(search);

      const attended = hasPostRating(item);

      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "attended" && attended) ||
        (filters.status === "pending" && !attended);

      return matchesSearch && matchesStatus;
    });
  }, [consultation, filters.search, filters.status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F6FF] p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!storage || !consultation) {
    return (
      <div className="min-h-screen bg-[#F2F6FF] p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173B8F] text-sm font-bold text-white">
                04
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">Co-Edu</h1>

                <p className="mt-1 text-sm text-slate-500">
                  Theo dõi hội viên đăng ký lớp và trạng thái tham dự.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <p className="text-sm font-medium text-slate-700">
              Chưa có dữ liệu Co-Edu.
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Vui lòng chọn “Đồng bộ dữ liệu” ở Sidebar.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#F2F6FF] p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173B8F] text-sm font-bold text-white">
                04
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">Co-Edu</h1>

                <p className="mt-1 text-sm text-slate-500">
                  Theo dõi hội viên đăng ký lớp và trạng thái tham dự.
                </p>
              </div>
            </div>
          </div>

          <CoEduStats consultation={consultation} />

          <div className="mt-6">
            <CoEduFilters
              filters={filters}
              total={consultation.total}
              filteredTotal={filteredConsultations.length}
              onChange={setFilters}
              onReset={() => setFilters(DEFAULT_FILTERS)}
            />
          </div>

          <div className="mt-6">
            <CoEduTable
              consultations={filteredConsultations}
              onSelect={setSelectedItem}
            />
          </div>
        </div>
      </main>

      {selectedItem ? (
        <CoEduDetail
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      ) : null}
    </>
  );
}
