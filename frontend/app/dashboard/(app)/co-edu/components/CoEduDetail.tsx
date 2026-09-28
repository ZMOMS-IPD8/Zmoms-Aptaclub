"use client";

import { CheckCircle2, X } from "lucide-react";
import type { ReactNode } from "react";

import type { DashboardConsultation } from "../../types/dashboard";

function formatDateOnly(value: string): string {
  const normalized = value?.trim();

  if (!normalized) {
    return "—";
  }

  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return normalized;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[155px_minmax(0,1fr)] gap-4 border-b border-slate-100 py-3 last:border-b-0">
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

function SurveyBadge({ active, label }: { active: boolean; label: string }) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
      <CheckCircle2 size={14} />
      {label}
    </span>
  ) : (
    <span className="text-sm text-slate-400">Chưa có</span>
  );
}

export default function CoEduDetail({
  item,
  onClose,
}: {
  item: DashboardConsultation;
  onClose: () => void;
}) {
  const attended = item.postRating.trim() !== "";

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
              Chi tiết Co-Edu
            </p>

            <h2 className="mt-1 truncate text-xl font-bold text-slate-900">
              {item.name || "Hội viên"}
            </h2>

            {item.phone && (
              <p className="mt-1 text-sm text-slate-500">{item.phone}</p>
            )}
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
          <Section title="Thông tin lớp học">
            <DetailRow
              label="Ngày đăng ký lớp"
              value={formatDateOnly(item.registeredAt)}
            />

            <DetailRow
              label="Ngày tham dự"
              value={formatDateOnly(item.attendedAt)}
            />

            <DetailRow
              label="Trạng thái"
              value={
                attended ? (
                  <span className="font-semibold text-emerald-700">
                    Đã tham dự
                  </span>
                ) : (
                  <span className="font-medium text-slate-500">
                    Chưa tham dự
                  </span>
                )
              }
            />

            <DetailRow
              label="Link lớp học"
              value={
                item.classLink ? (
                  <a
                    href={item.classLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#173B8F] hover:underline"
                  >
                    Mở lớp học
                  </a>
                ) : (
                  "—"
                )
              }
            />
          </Section>

          <Section title="Khảo sát">
            <DetailRow
              label="Pre-survey"
              value={
                <SurveyBadge
                  active={Boolean(item.preSurvey)}
                  label="Đã hoàn thành"
                />
              }
            />

            <DetailRow
              label="Post-survey"
              value={
                <SurveyBadge
                  active={Boolean(item.postSurvey)}
                  label="Đã hoàn thành"
                />
              }
            />

            <DetailRow label="Đánh giá" value={item.postRating || "—"} />

            <DetailRow label="Nhu cầu hỗ trợ" value={item.supportNeed || "—"} />
          </Section>

          <Section title="Thông tin bé">
            <DetailRow label="Thứ tự con" value={item.childOrder || "—"} />

            <DetailRow
              label="Ưu tiên phát triển"
              value={item.developmentPriority || "—"}
            />
          </Section>

          <Section title="Phân loại sau lớp">
            <DetailRow label="Post group" value={item.postGroup || "—"} />
          </Section>
        </div>
      </aside>
    </div>
  );
}
