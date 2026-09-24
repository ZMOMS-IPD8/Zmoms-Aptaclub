import type { DashboardConsultationData } from "../../types/dashboard";

function formatNumber(value: number) {
  return value.toLocaleString("vi-VN");
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

export default function CoEduStats({
  consultation,
}: {
  consultation: DashboardConsultationData;
}) {
  const pending = Math.max(
    consultation.registered - consultation.postSurveyCompleted,
    0,
  );

  const cards = [
    {
      title: "Co-Edu",
      value: formatNumber(consultation.registered),
      description: "Đã đăng ký lớp",
      className: "border-blue-100",
      valueClassName: "text-[#173B8F]",
    },
    {
      title: "Đã tham dự",
      value: formatNumber(consultation.postSurveyCompleted),
      description: "Đã có Post-survey",
      className: "border-emerald-100",
      valueClassName: "text-emerald-700",
    },
    {
      title: "Chưa tham dự",
      value: formatNumber(pending),
      description: "Chưa có Post-survey",
      className: "border-slate-200",
      valueClassName: "text-slate-700",
    },
    {
      title: "Tỷ lệ tham dự",
      value: formatPercent(consultation.attendanceRate),
      description: "Đã tham dự / đăng ký",
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
