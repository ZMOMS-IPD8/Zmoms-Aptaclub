type DashboardHeaderProps = {
  loading: boolean;
  onRefresh: () => void;
};

export default function DashboardHeader({
  loading,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-[#173B8F] sm:text-3xl">
          ZMOMS Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Tổng quan dữ liệu từ Pancake CRM
        </p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="rounded-xl bg-[#173B8F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123174] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Đang tải..." : "Làm mới dữ liệu"}
      </button>
    </header>
  );
}
