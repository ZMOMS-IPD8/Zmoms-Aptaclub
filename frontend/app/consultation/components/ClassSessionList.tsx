import {
  formatClassDate,
  type ClassSession,
  type Region,
} from "../data/classSessions";

type Props = {
  sessions: ClassSession[];
  region: Region;
  selectedId: string;
  onSelect: (session: ClassSession) => void;
  onConfirm: () => void;
  onBack: () => void;
  loading: boolean;
  error: string;
};

const CLASS_TITLE =
  'Buổi tư vấn online: "CÁCH XỬ TRÍ CÁC TÌNH HUỐNG THƯỜNG GẶP KHI NUÔI CON BẰNG SỮA MẸ"';

export default function ClassSessionList({
  sessions,
  region,
  selectedId,
  onSelect,
  onConfirm,
  onBack,
  loading,
  error,
}: Props) {
  const regionName = region === "north" ? "MIỀN BẮC" : "MIỀN NAM";

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
      <p className="text-xs font-bold uppercase tracking-wide text-[#18A8DC]">
        Tư vấn trực tuyến online
      </p>

      <h2 className="mt-1 text-xl font-extrabold leading-7 text-[#12335B]">
        {CLASS_TITLE}
      </h2>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        Các buổi tư vấn dành cho hội viên {regionName}. Mẹ vui lòng chọn thời
        gian phù hợp.
      </p>

      {sessions.length === 0 ? (
        <div className="mt-5 rounded-2xl bg-[#F5F9FC] p-5 text-center">
          <p className="text-sm font-medium text-gray-600">
            Hiện chưa có lớp học phù hợp. Mẹ vui lòng quay lại sau.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {sessions.map((session) => {
            const selected = selectedId === session.id;

            return (
              <button
                key={session.id}
                type="button"
                onClick={() => onSelect(session)}
                disabled={loading}
                className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                  selected
                    ? "border-[#12335B] bg-[#F5F9FC]"
                    : "border-[#D8E1EB] bg-white hover:border-[#18A8DC]"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Thời gian tham dự
                  </p>

                  <p className="mt-1 text-base font-extrabold text-[#12335B]">
                    {formatClassDate(session.date)}
                    <span className="mx-2 text-gray-300">·</span>
                    {session.time}
                  </p>
                </div>

                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    selected
                      ? "border-[#12335B] bg-[#12335B]"
                      : "border-[#C9D4DF]"
                  }`}
                >
                  {selected && (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onConfirm}
        disabled={!selectedId || loading || sessions.length === 0}
        className="mt-6 h-12 w-full rounded-xl bg-[#12335B] text-sm font-bold text-white hover:bg-[#0D2949] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "ĐANG ĐĂNG KÝ..." : "XÁC NHẬN THAM DỰ"}
      </button>

      <button
        type="button"
        onClick={onBack}
        disabled={loading}
        className="mt-2 h-10 w-full text-sm font-bold text-gray-500 hover:text-[#12335B]"
      >
        ← Quay lại
      </button>
    </section>
  );
}
