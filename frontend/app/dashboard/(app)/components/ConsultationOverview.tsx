import { formatNumber, formatPercent } from "../utils/format";

type ConsultationOverviewProps = {
  total: number;
  registered: number;
  attended: number;
  attendanceRate: number;
};

export default function ConsultationOverview({
  total,
  registered,
  attended,
  attendanceRate,
}: ConsultationOverviewProps) {
  const notAttended = Math.max(registered - attended, 0);

  const cards = [
    {
      label: "Tổng Co-Edu",
      value: total,
      background: "bg-gray-50",
      text: "text-gray-900",
    },
    {
      label: "Đăng ký lớp",
      value: registered,
      background: "bg-blue-50",
      text: "text-[#173B8F]",
    },
    {
      label: "Đã tham dự",
      value: attended,
      background: "bg-green-50",
      text: "text-green-700",
    },
    {
      label: "Chưa tham dự",
      value: notAttended,
      background: "bg-orange-50",
      text: "text-orange-700",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl p-5 ${card.background}`}
          >
            <p className="text-xs font-medium text-gray-500">{card.label}</p>

            <p className={`mt-2 text-2xl font-bold ${card.text}`}>
              {formatNumber(card.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700">
              Tỷ lệ tham dự lớp học
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Đã tham dự / Đã đăng ký lớp
            </p>
          </div>

          <span className="text-xl font-bold text-[#173B8F]">
            {formatPercent(attendanceRate)}
          </span>
        </div>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-[#173B8F] transition-all"
            style={{
              width: `${Math.min(Math.max(attendanceRate, 0), 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
