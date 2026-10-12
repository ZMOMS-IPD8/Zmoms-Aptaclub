export type OrderPeriod = "today" | "week" | "month" | "all";

type Props = {
  value: OrderPeriod;
  onChange: (value: OrderPeriod) => void;
};

const periods: { label: string; value: OrderPeriod }[] = [
  { label: "Hôm nay", value: "today" },
  { label: "Tuần này", value: "week" },
  { label: "Tháng này", value: "month" },
  { label: "Toàn bộ", value: "all" },
];

export default function OrderPeriodFilter({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {periods.map((period) => {
        const active = value === period.value;

        return (
          <button
            key={period.value}
            type="button"
            onClick={() => onChange(period.value)}
            aria-pressed={active}
            className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
              active
                ? "border-[#12335B] bg-[#12335B] text-white shadow-sm"
                : "border-[#D8E1EB] bg-white text-gray-600 hover:border-[#18A8DC] hover:text-[#12335B]"
            }`}
          >
            {period.label}
          </button>
        );
      })}
    </div>
  );
}
