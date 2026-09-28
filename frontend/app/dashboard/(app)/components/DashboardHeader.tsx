export default function DashboardHeader() {
  return (
    <header className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-[#173B8F] sm:text-3xl">
          ZMOMS Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Tổng quan dữ liệu Dashboard
        </p>
      </div>
    </header>
  );
}
