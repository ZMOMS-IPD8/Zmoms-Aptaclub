import type { DashboardBabyCareData } from "../../types/dashboard";

function formatNumber(value: number) {
  return value.toLocaleString("vi-VN");
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

export default function CoLeadStats({
  babyCare,
}: {
  babyCare: DashboardBabyCareData;
}) {
  const cards = [
    {
      title: "Co-Lead",
      value: formatNumber(babyCare.registered),
      description: "Đã đăng ký tắm bé",
      className: "border-blue-100",
      valueClassName: "text-[#173B8F]",
    },
    {
      title: "Đã hoàn thành",
      value: formatNumber(babyCare.completed),
      description: "Đã có nhân viên thực hiện",
      className: "border-emerald-100",
      valueClassName: "text-emerald-700",
    },
    {
      title: "Chưa hoàn thành",
      value: formatNumber(babyCare.pending),
      description: "Chưa có nhân viên thực hiện",
      className: "border-slate-200",
      valueClassName: "text-slate-700",
    },
    {
      title: "Tỷ lệ hoàn thành",
      value: formatPercent(babyCare.completionRate),
      description: "Đã hoàn thành / đăng ký",
      className: "border-blue-100",
      valueClassName: "text-[#173B8F]",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`rounded-2xl border bg-white p-5 shadow-sm ${card.className}`}
        >
          <p className="text-sm font-medium text-slate-500">{card.title}</p>

          <p className={`mt-2 text-2xl font-bold ${card.valueClassName}`}>
            {card.value}
          </p>

          <p className="mt-2 text-xs text-slate-500">{card.description}</p>
        </div>
      ))}
    </div>
  );
}
