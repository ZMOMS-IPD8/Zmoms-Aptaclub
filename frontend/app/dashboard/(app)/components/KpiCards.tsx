import { formatNumber } from "../utils/format";

type KpiCardsProps = {
  coData: number;
  coEdu: number;
  coLead: number;
  coSell: number;
};

export default function KpiCards({
  coData,
  coEdu,
  coLead,
  coSell,
}: KpiCardsProps) {
  const cards = [
    {
      label: "Co-Data",
      value: coData,
      description: "Đã hoàn tất đăng ký",
      className: "bg-blue-50 border-blue-100",
      valueClassName: "text-[#173B8F]",
    },
    {
      label: "Co-Edu",
      value: coEdu,
      description: "Đã đăng ký lớp học",
      className: "bg-purple-50 border-purple-100",
      valueClassName: "text-purple-700",
    },
    {
      label: "Co-Lead",
      value: coLead,
      description: "Đã đăng ký dịch vụ tắm bé",
      className: "bg-orange-50 border-orange-100",
      valueClassName: "text-orange-700",
    },
    {
      label: "Co-Sell",
      value: coSell,
      description: "Đã giao hàng thành công",
      className: "bg-green-50 border-green-100",
      valueClassName: "text-green-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-2xl border p-5 shadow-sm ${card.className}`}
        >
          <p className="text-sm font-semibold text-gray-600">{card.label}</p>

          <p className={`mt-3 text-3xl font-bold ${card.valueClassName}`}>
            {formatNumber(card.value)}
          </p>

          <p className="mt-2 text-xs text-gray-500">{card.description}</p>
        </div>
      ))}
    </div>
  );
}
