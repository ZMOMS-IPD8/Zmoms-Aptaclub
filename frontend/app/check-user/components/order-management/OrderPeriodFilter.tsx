"use client";

type Props = {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
  loading?: boolean;
};

export default function OrderPeriodFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
  onClear,
  loading = false,
}: Props) {
  const invalidRange = Boolean(startDate && endDate) && startDate > endDate;

  const hasDateFilter = Boolean(startDate || endDate);

  const handleApply = () => {
    if (invalidRange || loading) return;
    onApply();
  };

  const handleClear = () => {
    if (!hasDateFilter || loading) return;
    onClear();
  };

  return (
    <section
      aria-label="Bộ lọc thời gian đơn hàng"
      className="rounded-2xl border border-[#E5EBF2] bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="mb-4">
        <h2 className="text-sm font-bold text-[#12335B]">Lọc theo thời gian</h2>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          Chọn khoảng ngày để lọc danh sách đơn hàng.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label
            htmlFor="order-start-date"
            className="mb-1.5 block text-sm font-medium text-gray-600"
          >
            Từ ngày
          </label>

          <input
            id="order-start-date"
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(event) => onStartDateChange(event.target.value)}
            aria-invalid={invalidRange}
            aria-describedby={invalidRange ? "order-date-error" : undefined}
            disabled={loading}
            className="min-h-11 w-full rounded-xl border border-[#D8E1EB] bg-white px-3 py-2 text-sm text-[#12335B] outline-none transition focus:border-[#18A8DC] focus:ring-4 focus:ring-[#18A8DC]/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60"
          />
        </div>

        <div className="min-w-0 flex-1">
          <label
            htmlFor="order-end-date"
            className="mb-1.5 block text-sm font-medium text-gray-600"
          >
            Đến ngày
          </label>

          <input
            id="order-end-date"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(event) => onEndDateChange(event.target.value)}
            aria-invalid={invalidRange}
            aria-describedby={invalidRange ? "order-date-error" : undefined}
            disabled={loading}
            className="min-h-11 w-full rounded-xl border border-[#D8E1EB] bg-white px-3 py-2 text-sm text-[#12335B] outline-none transition focus:border-[#18A8DC] focus:ring-4 focus:ring-[#18A8DC]/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60"
          />
        </div>

        <div className="flex gap-2 sm:shrink-0">
          <button
            type="button"
            onClick={handleApply}
            disabled={invalidRange || loading}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#12335B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#194778] focus:outline-none focus:ring-4 focus:ring-[#12335B]/20 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
          >
            {loading ? (
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              />
            ) : (
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 5h16l-6.5 7.5V19l-3 1v-7.5L4 5Z" />
              </svg>
            )}

            {loading ? "Đang tải..." : "Áp dụng"}
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={!hasDateFilter || loading}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#D8E1EB] px-4 py-2.5 text-sm font-semibold text-[#12335B] transition hover:border-[#18A8DC] hover:bg-[#F3FBFE] focus:outline-none focus:ring-4 focus:ring-[#18A8DC]/20 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="m19 6-1 14H6L5 6" />
              <path d="M10 11v5M14 11v5" />
            </svg>
            Xóa lọc
          </button>
        </div>
      </div>

      {invalidRange && (
        <p
          id="order-date-error"
          className="mt-3 text-sm font-medium text-red-600"
          role="alert"
        >
          Ngày bắt đầu không được sau ngày kết thúc.
        </p>
      )}
    </section>
  );
}
