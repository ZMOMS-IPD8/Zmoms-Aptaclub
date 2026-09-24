import { MapPin, Phone, Tag, UserRound, Users } from "lucide-react";

type LeadStatsProps = {
  total: number;
  withPhone: number;
  withReferral: number;
  withProvince: number;
  withMotherStatus: number;
};

const cards = [
  {
    key: "total",
    label: "Tổng Lead",
    icon: Users,
  },
  {
    key: "withPhone",
    label: "Có SĐT",
    icon: Phone,
  },
  {
    key: "withReferral",
    label: "Có Referral Code",
    icon: Tag,
  },
  {
    key: "withProvince",
    label: "Có tỉnh/thành",
    icon: MapPin,
  },
  {
    key: "withMotherStatus",
    label: "Có tình trạng mẹ",
    icon: UserRound,
  },
] as const;

export default function LeadStats({
  total,
  withPhone,
  withReferral,
  withProvince,
  withMotherStatus,
}: LeadStatsProps) {
  const values = {
    total,
    withPhone,
    withReferral,
    withProvince,
    withMotherStatus,
  };

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(({ key, label, icon: Icon }) => (
        <div
          key={key}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3FF] text-[#173B8F]">
            <Icon className="h-5 w-5" />
          </div>

          <p className="text-sm text-slate-500">{label}</p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {values[key].toLocaleString("vi-VN")}
          </p>
        </div>
      ))}
    </div>
  );
}
