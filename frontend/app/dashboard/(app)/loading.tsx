export default function DashboardLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/75 backdrop-blur-sm">
      <div className="flex w-[340px] flex-col items-center rounded-2xl bg-white px-7 py-8 text-center shadow-xl">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#173B8F]" />

        <p className="mt-5 text-lg font-semibold text-[#173B8F]">
          Đang tải dữ liệu...
        </p>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Đang đồng bộ dữ liệu từ hệ thống.
          <br />
          Vui lòng chờ trong giây lát.
        </p>
      </div>
    </div>
  );
}
