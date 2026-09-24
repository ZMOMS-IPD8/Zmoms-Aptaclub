import type { CoDataLead } from "../types";

function getValue(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object" && "value" in value) {
    return String((value as { value?: unknown }).value ?? "").trim();
  }
  return "";
}

function countWithField(entries: CoDataLead[], field: string) {
  return entries.filter((entry) => getValue(entry[field]) !== "").length;
}

function Kpi({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{title}</p>

      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {value.toLocaleString("vi-VN")}
      </p>
    </div>
  );
}

export default function CoDataStats({ entries }: { entries: CoDataLead[] }) {
  const total = entries.length;

  const ebook = countWithField(entries, "email_nhan_ebook");
  const referral = countWithField(entries, "ma_gioi_thieu_dang_ky");
  const phone = entries.filter(
    (entry) =>
      getValue(entry.so_dien_thoai_dang_ky) || getValue(entry.phone_number),
  ).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi title="Tổng Co-Data" value={total} />
      <Kpi title="Có số điện thoại" value={phone} />
      <Kpi title="Đã nhận E-Book" value={ebook} />
      <Kpi title="Có mã giới thiệu" value={referral} />
    </div>
  );
}
