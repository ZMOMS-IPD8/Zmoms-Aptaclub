import { isTrue } from "@/lib/dashboard/logic";
import type { CoDataLead } from "../types";

function getValue(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);

  if (value && typeof value === "object" && "value" in value) {
    return String((value as { value?: unknown }).value ?? "").trim();
  }

  return "";
}

function Kpi({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{title}</p>

      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {typeof value === "number" ? value.toLocaleString("vi-VN") : value}
      </p>
    </div>
  );
}

export default function CoDataStats({ entries }: { entries: CoDataLead[] }) {
  const total = entries.length;

  const consent = entries.filter((entry) =>
    isTrue(entry.chia_se_de_dang_ky_aptaclub),
  ).length;

  const consentRate = total > 0 ? (consent / total) * 100 : 0;

  const babyDate = entries.filter(
    (entry) => getValue(entry.ngay_du_sinh_hoac_ngay_sinh_cua_be) !== "",
  ).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi title="Tổng Co-Data" value={total} />

      <Kpi title="Consent Aptaclub" value={consent} />

      <Kpi title="Tỷ lệ Consent" value={`${consentRate.toFixed(1)}%`} />

      <Kpi title="Có ngày dự sinh / ngày sinh bé" value={babyDate} />
    </div>
  );
}
