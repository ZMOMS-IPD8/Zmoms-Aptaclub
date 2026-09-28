import type { DashboardConsultationData } from "../../types/dashboard";

export default function CoEduStats({
  consultation,
}: {
  consultation: DashboardConsultationData;
}) {
  const registered = consultation.consultations.filter(
    (item) => item.registeredAt.trim() !== "",
  ).length;

  const attended = consultation.consultations.filter(
    (item) => item.postRating.trim() !== "",
  ).length;

  const notAttended = Math.max(registered - attended, 0);

  const cards = [
    {
      label: "Co-Edu",
      value: consultation.total,
      description: "Tổng khách hàng Co-Edu",
      background: "bg-gray-50",
      text: "text-gray-900",
    },
    {
      label: "Đăng ký lớp",
      value: registered,
      description: "Đã đăng ký lớp học",
      background: "bg-blue-50",
      text: "text-[#173B8F]",
    },
    {
      label: "Đã tham dự",
      value: attended,
      description: "Có đánh giá sau buổi tư vấn",
      background: "bg-green-50",
      text: "text-green-700",
    },
    {
      label: "Chưa tham dự",
      value: notAttended,
      description: "Chưa có đánh giá sau buổi tư vấn",
      background: "bg-orange-50",
      text: "text-orange-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className={`rounded-2xl p-5 ${card.background}`}>
          <p className="text-xs font-medium text-gray-500">{card.label}</p>

          <p className={`mt-2 text-2xl font-bold ${card.text}`}>
            {card.value.toLocaleString("vi-VN")}
          </p>

          <p className="mt-2 text-xs text-gray-500">{card.description}</p>
        </div>
      ))}
    </div>
  );
}
