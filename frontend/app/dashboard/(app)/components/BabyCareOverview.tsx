import { formatNumber, formatPercent } from "../utils/format";

type BabyCareOverviewProps = {
  total: number;
  registered: number;
  completed: number;
  pending: number;
  completionRate: number;
};

export default function BabyCareOverview({
  total,
  registered,
  completed,
  pending,
  completionRate,
}: BabyCareOverviewProps) {
  const cards = [
    {
      label: "Tổng Co-Lead",
      value: total,
      background: "bg-gray-50",
      text: "text-gray-900",
    },
    {
      label: "Đăng ký",
      value: registered,
      background: "bg-blue-50",
      text: "text-[#173B8F]",
    },
    {
      label: "Hoàn thành",
      value: completed,
      background: "bg-green-50",
      text: "text-green-700",
    },
    {
      label: "Đang chờ",
      value: pending,
      background: "bg-orange-50",
      text: "text-orange-700",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
              Tỷ lệ hoàn thành dịch vụ
            </p>

            <p className="mt-1 text-xs text-gray-400">Hoàn thành / Đăng ký</p>
          </div>

          <span className="text-xl font-bold text-[#173B8F]">
            {formatPercent(completionRate)}
          </span>
        </div>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-[#173B8F] transition-all"
            style={{
              width: `${Math.min(Math.max(completionRate, 0), 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
