"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  DashboardApiResponse,
  DashboardBabyCare,
  DashboardData,
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

export default function CoLeadClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<CoLeadFiltersState>(DEFAULT_FILTERS);
  const [selectedItem, setSelectedItem] = useState<DashboardBabyCare | null>(
    null,
  );

  useEffect(() => {
    let mounted = true;

    fetch("/api/dashboard/data", {
      cache: "no-store",
    })
      .then(async (response) => {
        if (response.status === 401) {
          window.location.replace("/dashboard/login");
          throw new Error("Unauthorized");
        }

        const result =
          (await response.json()) as DashboardApiResponse<DashboardData>;

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Không thể tải dữ liệu Co-Lead.");
        }

        return result.data;
      })
      .then((result) => {
        if (mounted) {
          setData(result);
        }
      })
      .catch((error: unknown) => {
        if (!mounted) {
          return;
        }

        if (error instanceof Error && error.message === "Unauthorized") {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Không thể tải dữ liệu Co-Lead.",
        );
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const babyCare = data?.babyCare;

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

      const completed = Boolean(item.staff);

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
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
            Đang tải dữ liệu Co-Lead...
          </div>
        </div>
      </div>
    );
  }

  if (error || !data || !babyCare) {
    return (
      <div className="min-h-screen bg-[#F2F6FF] p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
            {error || "Không tải được dữ liệu Co-Lead."}
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
