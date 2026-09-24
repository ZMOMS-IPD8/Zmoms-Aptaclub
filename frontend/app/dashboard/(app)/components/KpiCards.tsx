import { formatNumber, formatPercent } from "../utils/format";

type KpiCardsProps = {
  total: number;
  coData: number;
  coEdu: number;
  coLead: number;
  coSell: number;
};

export default function KpiCards({
  total,
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

  const conversionRate = coData > 0 ? (coSell / coData) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-[#173B8F] p-6 text-white shadow-sm">
          <p className="text-sm font-medium text-white/70">Co-Data</p>

          <p className="mt-2 text-4xl font-bold tracking-tight">
            {formatNumber(coData)}
          </p>

          <p className="mt-2 text-xs text-white/60">
            Tổng dữ liệu đã hoàn tất đăng ký
          </p>
        </div>

        <div className="rounded-2xl bg-[#173B8F] p-6 text-white shadow-sm">
          <p className="text-sm font-medium text-white/70">NU</p>

          <p className="mt-2 text-4xl font-bold tracking-tight">
            {formatNumber(coSell)}
          </p>

          <p className="mt-2 text-xs text-white/60">Đã giao hàng thành công</p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Co-Data → NU</p>

          <p className="mt-2 text-4xl font-bold tracking-tight text-[#173B8F]">
            {formatPercent(conversionRate)}
          </p>

          <p className="mt-2 text-xs text-gray-500">Tỷ lệ chuyển đổi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Tổng record trên Pancake CRM
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Bao gồm toàn bộ dữ liệu đang có trên CRM.
            </p>
          </div>

          <p className="text-2xl font-bold text-gray-900">
            {formatNumber(total)}
          </p>
        </div>
      </div>
    </div>
  );
}
