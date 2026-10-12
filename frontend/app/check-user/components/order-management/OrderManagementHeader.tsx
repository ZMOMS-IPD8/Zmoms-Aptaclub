type Props = {
  employeeId: string;
  fullName: string;
  loggingOut: boolean;
  onLogout: () => void;
};

export default function OrderManagementHeader({
  employeeId,
  fullName,
  loggingOut,
  onLogout,
}: Props) {
  return (
    <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#E5EBF2] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-extrabold text-[#12335B] sm:text-2xl">
          Xin chào{fullName.trim() ? `, ${fullName.trim()}` : ""}
        </h1>

        {employeeId.trim() && (
          <p className="mt-2 text-sm text-gray-500">
            Mã nhân viên:{" "}
            <span className="font-semibold text-[#12335B]">
              {employeeId.trim()}
            </span>
          </p>
        )}

        <p className="mt-1 text-sm text-gray-500">
          Chúc bạn có một ngày làm việc hiệu quả!
        </p>
      </div>

      <button
        type="button"
        onClick={onLogout}
        disabled={loggingOut}
        aria-busy={loggingOut}
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#D8E1EB] px-4 py-2.5 text-sm font-semibold text-[#12335B] transition hover:border-[#18A8DC] hover:bg-[#F3FBFE] focus:outline-none focus:ring-4 focus:ring-[#18A8DC]/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loggingOut ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="3"
                opacity="0.25"
              />
              <path
                d="M21 12a9 9 0 0 0-9-9"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            Đang đăng xuất...
          </>
        ) : (
          <>
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
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
              <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
            </svg>
            Đăng xuất
          </>
        )}
      </button>
    </header>
  );
}
