"use client";

import { useMemo, useState } from "react";
import LeadFilters from "./LeadFilters";
import LeadStats from "./LeadStats";
import LeadTable from "./LeadTable";
import type { Lead } from "../types";

const PAGE_SIZE = 20;

type LeadsClientProps = {
  entries: Lead[];
  totalEntries: number;
};

function getValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object" && value !== null && "value" in value) {
    return String((value as { value?: unknown }).value ?? "");
  }

  return String(value);
}

function getLeadName(lead: Lead): string {
  return (
    getValue(lead.ho_va_ten_lien_he) || getValue(lead.name) || "Chưa có tên"
  );
}

function getLeadPhone(lead: Lead): string {
  return (
    getValue(lead.so_dien_thoai_dang_ky) ||
    getValue(lead.phone_number) ||
    "Chưa có SĐT"
  );
}

function getLeadSource(lead: Lead): string {
  return getValue(lead.nguon_dang_ky) || "Chưa xác định";
}

function getLeadProvince(lead: Lead): string {
  return getValue(lead.thanh_pho) || "Chưa có";
}

function getReferralCode(lead: Lead): string {
  return getValue(lead.ma_gioi_thieu_dang_ky) || "—";
}

function getMotherStatus(lead: Lead): string {
  return getValue(lead.tinh_trang_me) || "Chưa xác định";
}

export default function LeadsClient({
  entries,
  totalEntries,
}: LeadsClientProps) {
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("all");
  const [province, setProvince] = useState("all");
  const [motherStatus, setMotherStatus] = useState("all");
  const [referralCode, setReferralCode] = useState("all");
  const [page, setPage] = useState(1);

  const sources = useMemo(
    () => Array.from(new Set(entries.map(getLeadSource))).sort(),
    [entries],
  );

  const provinces = useMemo(
    () => Array.from(new Set(entries.map(getLeadProvince))).sort(),
    [entries],
  );

  const motherStatuses = useMemo(
    () => Array.from(new Set(entries.map(getMotherStatus))).sort(),
    [entries],
  );

  const referralCodes = useMemo(
    () =>
      Array.from(
        new Set(entries.map(getReferralCode).filter((value) => value !== "—")),
      ).sort(),
    [entries],
  );

  const filteredLeads = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return entries.filter((lead) => {
      const name = getLeadName(lead).toLowerCase();
      const phone = getLeadPhone(lead).toLowerCase();

      const matchSearch =
        !keyword || name.includes(keyword) || phone.includes(keyword);

      const matchSource = source === "all" || getLeadSource(lead) === source;

      const matchProvince =
        province === "all" || getLeadProvince(lead) === province;

      const matchMotherStatus =
        motherStatus === "all" || getMotherStatus(lead) === motherStatus;

      const matchReferral =
        referralCode === "all" || getReferralCode(lead) === referralCode;

      return (
        matchSearch &&
        matchSource &&
        matchProvince &&
        matchMotherStatus &&
        matchReferral
      );
    });
  }, [entries, search, source, province, motherStatus, referralCode]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE));

  const currentPage = Math.min(page, totalPages);

  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return filteredLeads.slice(start, start + PAGE_SIZE);
  }, [filteredLeads, currentPage]);

  const stats = useMemo(() => {
    const withPhone = entries.filter(
      (lead) => getLeadPhone(lead) !== "Chưa có SĐT",
    ).length;

    const withReferral = entries.filter(
      (lead) => getReferralCode(lead) !== "—",
    ).length;

    const withProvince = entries.filter(
      (lead) => getLeadProvince(lead) !== "Chưa có",
    ).length;

    const withMotherStatus = entries.filter(
      (lead) => getMotherStatus(lead) !== "Chưa xác định",
    ).length;

    return {
      total: entries.length,
      withPhone,
      withReferral,
      withProvince,
      withMotherStatus,
    };
  }, [entries]);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleSource(value: string) {
    setSource(value);
    setPage(1);
  }

  function handleProvince(value: string) {
    setProvince(value);
    setPage(1);
  }

  function handleMotherStatus(value: string) {
    setMotherStatus(value);
    setPage(1);
  }

  function handleReferralCode(value: string) {
    setReferralCode(value);
    setPage(1);
  }

  return (
    <div className="min-h-full bg-[#F2F6FF] p-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#173B8F]">Lead</h1>

          <p className="mt-1 text-sm text-slate-500">
            Danh sách khách hàng chưa hoàn tất đăng ký
          </p>
        </div>

        <LeadStats
          total={stats.total}
          withPhone={stats.withPhone}
          withReferral={stats.withReferral}
          withProvince={stats.withProvince}
          withMotherStatus={stats.withMotherStatus}
        />

        <LeadFilters
          search={search}
          source={source}
          province={province}
          motherStatus={motherStatus}
          referralCode={referralCode}
          sources={sources}
          provinces={provinces}
          motherStatuses={motherStatuses}
          referralCodes={referralCodes}
          onSearchChange={handleSearch}
          onSourceChange={handleSource}
          onProvinceChange={handleProvince}
          onMotherStatusChange={handleMotherStatus}
          onReferralCodeChange={handleReferralCode}
        />

        <LeadTable
          leads={paginatedLeads}
          filteredCount={filteredLeads.length}
          currentPage={currentPage}
          totalPages={totalPages}
          onPreviousPage={() => setPage((value) => Math.max(1, value - 1))}
          onNextPage={() => setPage((value) => Math.min(totalPages, value + 1))}
        />
      </div>
    </div>
  );
}
