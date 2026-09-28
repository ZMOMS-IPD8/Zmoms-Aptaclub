import type { DashboardOrdersData } from "../../types/dashboard";

function formatNumber(value: number) {
  return value.toLocaleString("vi-VN");
}

export default function CoSellStats({
  orders,
}: {
  orders: DashboardOrdersData;
}) {
  const cards = [
    {
      title: "Co-Sell",
      value: orders.delivered,
      description: "Đã giao hàng thành công",
      className: "border-blue-100",
      valueClassName: "text-[#173B8F]",
    },
    {
      title: "Đã thanh toán",
      value: orders.paid,
      description: "Đơn hàng đã thanh toán",
      className: "border-emerald-100",
      valueClassName: "text-emerald-700",
    },
    {
      title: "Chưa thanh toán",
      value: orders.unpaid,
      description: "Đơn hàng chưa thanh toán",
      className: "border-slate-200",
      valueClassName: "text-slate-700",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`rounded-2xl border bg-white p-5 shadow-sm ${card.className}`}
        >
          <p className="text-sm font-medium text-slate-500">{card.title}</p>

          <p className={`mt-2 text-2xl font-bold ${card.valueClassName}`}>
            {formatNumber(card.value)}
          </p>

          <p className="mt-2 text-xs text-slate-500">{card.description}</p>
        </div>
      ))}
    </div>
  );
}
