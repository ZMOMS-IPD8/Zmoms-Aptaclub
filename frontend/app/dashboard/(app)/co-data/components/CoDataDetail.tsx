"use client";

import { CheckCircle2, X } from "lucide-react";
import type { ReactNode } from "react";
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

function formatDateOnly(value: unknown): string {
  const raw = getValue(value);

  if (!raw) {
    return "";
  }

  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[150px_minmax(0,1fr)] gap-4 border-b border-slate-100 py-3 last:border-b-0">
      <span className="text-sm text-slate-500">{label}</span>

      <span className="break-words text-sm font-medium text-slate-800">
        {value || "—"}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>

      <div className="px-5">{children}</div>
    </section>
  );
}

function ConsentBadge({ active, label }: { active: boolean; label: string }) {
  if (!active) {
    return <span className="text-sm text-slate-400">Chưa đồng ý</span>;
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
      <CheckCircle2 size={14} />
      {label}
    </span>
  );
}

export default function CoDataDetail({
  entry,
  onClose,
}: {
  entry: CoDataLead;
  onClose: () => void;
}) {
  const name = getValue(entry.ho_va_ten_lien_he);

  const phone =
    getValue(entry.so_dien_thoai_dang_ky) || getValue(entry.phone_number);

  const province = getValue(entry.thanh_pho);
  const referralCode = getValue(entry.ma_gioi_thieu_dang_ky);
  const registeredAt = getValue(entry.thoi_gian_dang_ky);
  const babyDate = formatDateOnly(entry.ngay_du_sinh_hoac_ngay_sinh_cua_be);
  const motherStatus = getValue(entry.tinh_trang_me);
  const event = getValue(entry.nguon_dang_ky);

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Đóng chi tiết"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/30"
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[600px] flex-col bg-slate-50 shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#173B8F]">
              Chi tiết Co-Data
            </p>

            <h2 className="mt-1 truncate text-xl font-bold text-slate-900">
              {name || "Hội viên"}
            </h2>

            {phone && <p className="mt-1 text-sm text-slate-500">{phone}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <Section title="Thông tin hội viên">
            <DetailRow label="Họ và tên" value={name} />

            <DetailRow label="Số điện thoại" value={phone} />

            <DetailRow label="Tỉnh / thành" value={province} />

            <DetailRow label="Mã giới thiệu" value={referralCode} />

            <DetailRow
              label="Ngày đăng ký"
              value={registeredAt ? formatDateOnly(registeredAt) : "—"}
            />
          </Section>

          <Section title="Consent">
            <DetailRow
              label="Đăng ký Aptaclub"
              value={
                <ConsentBadge
                  active={isTrue(entry.chia_se_de_dang_ky_aptaclub)}
                  label="Đã đồng ý"
                />
              }
            />

            <DetailRow
              label="Đọc chính sách Aptamil"
              value={
                <ConsentBadge
                  active={isTrue(entry.da_doc_chinh_sach_aptamil)}
                  label="Đã đọc"
                />
              }
            />

            <DetailRow
              label="Nhận thông báo"
              value={
                <ConsentBadge
                  active={isTrue(entry.dong_y_nhan_thong_bao)}
                  label="Đã đồng ý"
                />
              }
            />
          </Section>

          <Section title="Thông tin mẹ & bé">
            <DetailRow label="Ngày dự sinh / ngày sinh bé" value={babyDate} />

            <DetailRow label="Tình trạng mẹ" value={motherStatus} />
          </Section>

          <Section title="Nguồn đăng ký">
            <DetailRow label="Nguồn đăng ký" value={event} />
          </Section>
        </div>
      </aside>
    </div>
  );
}
