"use client";

import { useMemo, useState } from "react";

import { transformDashboardData } from "@/lib/dashboard/transform";
import { useDashboardSession } from "../../components/DashboardSessionProvider";

import type {
  DashboardBabyCare,
  DashboardBabyCareData,
} from "../../types/dashboard";

import CoLeadDetail from "./CoLeadDetail";
import CoLeadFilters from "./CoLeadFilters";
import CoLeadStats from "./CoLeadStats";
import CoLeadTable from "./CoLeadTable";
import type { CoLeadFilters as CoLeadFiltersState } from "../types";

const DEFAULT_FILTERS: CoLeadFiltersState = {
  search: "",
  status: "all",
};

function isCompleted(item: DashboardBabyCare): boolean {
  return item.staff.trim() !== "" && item.note.trim() !== "";
}

export default function CoLeadClient() {
  const { storage, loading } = useDashboardSession();

  const [filters, setFilters] = useState<CoLeadFiltersState>(DEFAULT_FILTERS);

  const [selectedItem, setSelectedItem] = useState<DashboardBabyCare | null>(
    null,
  );

  const babyCare = useMemo<DashboardBabyCareData | null>(() => {
    if (!storage) {
      return null;
    }

    const data = transformDashboardData(storage.entries, storage.totalEntries);

    return data.babyCare;
  }, [storage]);

  const filteredBabyCare = useMemo(() => {
    if (!babyCare) {
      return [];
    }

    const search = filters.search.trim().toLowerCase();

    return babyCare.babyCare.filter((item) => {
      const name = item.name?.toLowerCase() || "";
      const phone = item.phone?.toLowerCase() || "";

      const matchesSearch =
        !search || name.includes(search) || phone.includes(search);

      const completed = isCompleted(item);

      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "completed" && completed) ||
        (filters.status === "pending" && !completed);

      return matchesSearch && matchesStatus;
    });
  }, [babyCare, filters.search, filters.status]);

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

  if (!storage || !babyCare) {
    return (
      <div className="min-h-screen bg-[#F2F6FF] p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173B8F] text-sm font-bold text-white">
                05
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">Co-Lead</h1>

                <p className="mt-1 text-sm text-slate-500">
                  Theo dõi hội viên đăng ký và hoàn thành dịch vụ tắm bé.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <p className="text-sm font-medium text-slate-700">
              Chưa có dữ liệu Co-Lead.
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
                05
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">Co-Lead</h1>

                <p className="mt-1 text-sm text-slate-500">
                  Theo dõi hội viên đăng ký và hoàn thành dịch vụ tắm bé.
                </p>
              </div>
            </div>
          </div>

          <CoLeadStats babyCare={babyCare} />

          <div className="mt-6">
            <CoLeadFilters
              filters={filters}
              total={babyCare.total}
              filteredTotal={filteredBabyCare.length}
              onChange={setFilters}
              onReset={() => setFilters(DEFAULT_FILTERS)}
            />
          </div>

          <div className="mt-6">
            <CoLeadTable
              babyCare={filteredBabyCare}
              onSelect={setSelectedItem}
            />
          </div>
        </div>
      </main>

      {selectedItem ? (
        <CoLeadDetail
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      ) : null}
    </>
  );
}
