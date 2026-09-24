"use client";

import type { DashboardBabyCare } from "../../types/dashboard";

function formatDateTime(value: string): string {
  const normalized = value?.trim();

  if (!normalized) {
    return "—";
  }

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return normalized;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-b-0">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-sm text-slate-700">{value || "—"}</p>
    </div>
  );
}

export default function CoLeadDetail({
  item,
  onClose,
}: {
  item: DashboardBabyCare;
  onClose: () => void;
}) {
  const completed = Boolean(item.staff);

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/30"
      />

      <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Chi tiết Co-Lead
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Thông tin đăng ký tắm bé
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 p-6">
          <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Thông tin hội viên
            </h3>

            <div className="rounded-2xl border border-slate-200 p-4">
              <DetailRow label="Họ tên" value={item.name} />
              <DetailRow label="Số điện thoại" value={item.phone} />
              <DetailRow label="Địa chỉ" value={item.address} />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Thông tin tắm bé
            </h3>

            <div className="rounded-2xl border border-slate-200 p-4">
              <DetailRow
                label="Đăng ký tắm bé"
                value={formatDateTime(item.registeredAt)}
              />

              <DetailRow
                label="Thời gian tắm bé"
                value={formatDateTime(item.serviceTime)}
              />

              <DetailRow
                label="Trạng thái"
                value={completed ? "Đã hoàn thành" : "Chưa hoàn thành"}
              />

              <DetailRow label="Nhân viên tắm bé" value={item.staff} />

              <DetailRow label="Ghi chú" value={item.note} />
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
