"use client";

import { useMemo, useState } from "react";
import { isTrue } from "@/lib/dashboard/logic";
import type { CoDataLead } from "../types";
import CoDataFilters from "./CoDataFilters";
import CoDataStats from "./CoDataStats";
import CoDataTable from "./CoDataTable";
import CoDataDetail from "./CoDataDetail";

function getValue(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);

  if (value && typeof value === "object" && "value" in value) {
    return String((value as { value?: unknown }).value ?? "").trim();
  }

  return "";
}

export default function CoDataClient({ entries }: { entries: CoDataLead[] }) {
  const [search, setSearch] = useState("");
  const [province, setProvince] = useState("all");
  const [source, setSource] = useState("all");
  const [motherStatus, setMotherStatus] = useState("all");
  const [consent, setConsent] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<CoDataLead | null>(null);

  const pageSize = 20;

  const provinces = useMemo(
    () =>
      Array.from(
        new Set(
          entries.map((item) => getValue(item.thanh_pho)).filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b, "vi")),
    [entries],
  );

  const sources = useMemo(
    () =>
      Array.from(
        new Set(
          entries.map((item) => getValue(item.nguon_dang_ky)).filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b, "vi")),
    [entries],
  );

  const motherStatuses = useMemo(
    () =>
      Array.from(
        new Set(
          entries.map((item) => getValue(item.tinh_trang_me)).filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b, "vi")),
    [entries],
  );

  const filteredEntries = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return entries.filter((item) => {
      const name = getValue(item.ho_va_ten_lien_he);

      const phone =
        getValue(item.so_dien_thoai_dang_ky) || getValue(item.phone_number);

      const matchesSearch =
        !keyword ||
        name.toLowerCase().includes(keyword) ||
        phone.toLowerCase().includes(keyword);

      const matchesProvince =
        province === "all" || getValue(item.thanh_pho) === province;

      const matchesSource =
        source === "all" || getValue(item.nguon_dang_ky) === source;

      const matchesMotherStatus =
        motherStatus === "all" || getValue(item.tinh_trang_me) === motherStatus;

      const hasConsent = isTrue(item.chia_se_de_dang_ky_aptaclub);

      const matchesConsent =
        consent === "all" ||
        (consent === "yes" && hasConsent) ||
        (consent === "no" && !hasConsent);

      return (
        matchesSearch &&
        matchesProvince &&
        matchesSource &&
        matchesMotherStatus &&
        matchesConsent
      );
    });
  }, [entries, search, province, source, motherStatus, consent]);

  const totalPages = Math.max(Math.ceil(filteredEntries.length / pageSize), 1);

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedEntries = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;

    return filteredEntries.slice(start, start + pageSize);
  }, [filteredEntries, safeCurrentPage]);

  function handleSearch(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  function handleProvince(value: string) {
    setProvince(value);
    setCurrentPage(1);
  }

  function handleSource(value: string) {
    setSource(value);
    setCurrentPage(1);
  }

  function handleMotherStatus(value: string) {
    setMotherStatus(value);
    setCurrentPage(1);
  }

  function handleConsent(value: string) {
    setConsent(value);
    setCurrentPage(1);
  }

  function handleReset() {
    setSearch("");
    setProvince("all");
    setSource("all");
    setMotherStatus("all");
    setConsent("all");
    setCurrentPage(1);
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Co-Data</h1>

        <p className="mt-1 text-sm text-slate-500">
          Danh sách hội viên đã đăng ký và thông tin thu thập.
        </p>
      </div>

      <CoDataStats entries={entries} />

      <div className="mt-6">
        <CoDataFilters
          search={search}
          province={province}
          source={source}
          motherStatus={motherStatus}
          consent={consent}
          provinces={provinces}
          sources={sources}
          motherStatuses={motherStatuses}
          onSearchChange={handleSearch}
          onProvinceChange={handleProvince}
          onSourceChange={handleSource}
          onMotherStatusChange={handleMotherStatus}
          onConsentChange={handleConsent}
          onReset={handleReset}
        />
      </div>

      <div className="mt-6">
        <CoDataTable
          entries={paginatedEntries}
          total={filteredEntries.length}
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onSelect={setSelectedEntry}
        />
      </div>

      {selectedEntry && (
        <CoDataDetail
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  );
}
