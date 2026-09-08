"use client";

type GroupValue = "Nhóm A" | "Nhóm B" | "Nhóm C";

type Props = {
  value: string;
  onChange: (value: GroupValue) => void;
};

const OPTIONS: {
  value: GroupValue;
  letter: string;
  title: string;
  description: string;
}[] = [
  {
    value: "Nhóm A",
    letter: "A",
    title: "Đã hiểu và sẵn sàng áp dụng",
    description:
      "Mẹ đã nắm được kiến thức và biết cách xử lý những tình huống quan trọng khi nuôi con.",
  },
  {
    value: "Nhóm B",
    letter: "B",
    title: "Đã hiểu nhưng vẫn cần được hỗ trợ",
    description:
      "Mẹ đã có thêm kiến thức sau buổi tư vấn nhưng vẫn còn một số vấn đề muốn được hướng dẫn thêm.",
  },
  {
    value: "Nhóm C",
    letter: "C",
    title: "Cần được đồng hành chuyên sâu",
    description:
      "Mẹ còn nhiều băn khoăn hoặc đang gặp vấn đề cần được tư vấn và hỗ trợ cụ thể.",
  },
];

export default function PostSurveyGroupChoice({ value, onChange }: Props) {
  return (
    <div>
      <p className="text-sm font-semibold leading-6 text-[#12335B]">
        Sau buổi tư vấn, mẹ cảm thấy mình đang ở mức độ nào?
      </p>

      <p className="mt-1 text-xs leading-5 text-gray-500">
        Mẹ lựa chọn phương án phù hợp nhất với tình trạng hiện tại của mình.
      </p>

      <div className="mt-3 space-y-3">
        {OPTIONS.map((option) => {
          const selected = value === option.value;

          return (
            <label
              key={option.value}
              className={`block cursor-pointer rounded-2xl border p-4 transition ${
                selected
                  ? "border-[#18A8DC] bg-[#F0FAFD] ring-2 ring-[#18A8DC]/10"
                  : "border-[#D8E1EB] bg-white hover:border-[#18A8DC]"
              }`}
            >
              <input
                type="radio"
                name="post-survey-group"
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />

              <div className="flex items-start gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${
                    selected
                      ? "bg-[#18A8DC] text-white"
                      : "bg-[#EAF1F6] text-[#12335B]"
                  }`}
                >
                  {option.letter}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold leading-5 text-[#12335B]">
                    {option.title}
                  </p>

                  <p className="mt-1.5 text-sm leading-5 text-gray-500">
                    {option.description}
                  </p>
                </div>

                <div
                  className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    selected ? "border-[#18A8DC]" : "border-[#B8C5D3]"
                  }`}
                >
                  {selected && (
                    <div className="h-2.5 w-2.5 rounded-full bg-[#18A8DC]" />
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
