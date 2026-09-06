"use client";

type Props = {
  onAttended: () => void;
  onNotAttended: () => void;
  hasPreSurvey?: boolean;
  hasPostSurvey?: boolean;
  error?: string;
};

export default function AttendanceChoice({
  onAttended,
  onNotAttended,
  hasPreSurvey = false,
  hasPostSurvey = false,
  error = "",
}: Props) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-base font-bold text-[#12335B]">
        Mẹ đã tham dự lớp học chưa?
      </h2>

      <p className="mt-1 text-sm leading-6 text-gray-500">
        Mẹ lựa chọn tình trạng tham dự để tiếp tục.
      </p>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
          {error}
        </div>
      )}

      <div className="mt-5 space-y-3">
        <button
          type="button"
          onClick={onAttended}
          disabled={hasPostSurvey}
          className={`w-full rounded-2xl border p-4 text-left transition ${
            hasPostSurvey
              ? "cursor-not-allowed border-[#D8E1EB] bg-[#F5F9FC] opacity-90"
              : "border-[#D8E1EB] bg-white hover:border-[#18A8DC] hover:bg-[#F8FCFE]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
                hasPostSurvey
                  ? "bg-[#E8F8FD] text-[#18A8DC]"
                  : "bg-[#EAF1F6] text-[#12335B]"
              }`}
            >
              {hasPostSurvey ? "✓" : "🎓"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#12335B]">
                {hasPostSurvey
                  ? "MẸ ĐÃ ĐÁNH GIÁ RỒI"
                  : "TÔI ĐÃ THAM DỰ LỚP HỌC"}
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                {hasPostSurvey
                  ? "Mẹ đã hoàn thành khảo sát sau buổi học và không cần thực hiện lại."
                  : hasPreSurvey
                    ? "Thực hiện khảo sát và bình chọn sau buổi học."
                    : "Mẹ cần hoàn thành khảo sát trước buổi học trước khi đánh giá sau."}
              </p>
            </div>

            {hasPostSurvey && (
              <span className="shrink-0 rounded-full bg-[#E8F8FD] px-3 py-1 text-xs font-bold text-[#18A8DC]">
                ĐÃ HOÀN THÀNH
              </span>
            )}
          </div>
        </button>

        <button
          type="button"
          onClick={onNotAttended}
          className="w-full rounded-2xl border border-[#D8E1EB] bg-white p-4 text-left transition hover:border-[#18A8DC] hover:bg-[#F8FCFE]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF1F6] text-lg text-[#12335B]">
              📚
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#12335B]">
                TÔI CHƯA THAM DỰ LỚP HỌC
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Xem quyền lợi và đăng ký một buổi học phù hợp.
              </p>
            </div>

            <span className="text-lg text-gray-400">›</span>
          </div>
        </button>
      </div>
    </section>
  );
}
