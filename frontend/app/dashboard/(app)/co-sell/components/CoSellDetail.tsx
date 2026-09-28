"use client";

import type { DashboardOrder } from "../../types/dashboard";

function formatDate(value: string): string {
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-b-0">
      <p className="text-xs font-medium text-slate-400">{label}</p>

      <p className="mt-1 text-sm text-slate-700">{value || "—"}</p>
    </div>
  );
}

export default function CoSellDetail({
  item,
  onClose,
}: {
  item: DashboardOrder;
  onClose: () => void;
}) {
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
              Chi tiết Co-Sell
            </h2>

            <p className="mt-1 text-xs text-slate-500">Thông tin đơn hàng</p>
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
              Khách hàng
            </h3>

            <div className="rounded-2xl border border-slate-200 p-4">
              <DetailRow label="Họ tên" value={item.name} />

              <DetailRow label="Số điện thoại" value={item.phone} />

              <DetailRow label="Người nhận" value={item.receiverName} />

              <DetailRow
                label="Số điện thoại nhận hàng"
                value={item.receiverPhone}
              />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Đơn hàng
            </h3>

            <div className="rounded-2xl border border-slate-200 p-4">
              <DetailRow label="Mã đơn hàng" value={item.orderCode} />

              <DetailRow label="Combo" value={item.combo} />

              <DetailRow
                label="Ngày đặt hàng"
                value={formatDate(item.orderDate)}
              />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Thanh toán & giao hàng
            </h3>

            <div className="rounded-2xl border border-slate-200 p-4">
              <DetailRow label="Thanh toán" value={item.paymentStatus} />

              <DetailRow
                label="Trạng thái giao hàng"
                value={item.deliveryStatus}
              />
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
