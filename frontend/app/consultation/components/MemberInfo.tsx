import type { Member } from "../types/consultation";

type Props = {
  member: Member;
  region: "north" | "south" | null;
};

export default function MemberInfo({ member, region }: Props) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
      <p className="text-xs font-bold uppercase tracking-wide text-[#18A8DC]">
        Thông tin hội viên
      </p>

      <h2 className="mt-1 text-xl font-extrabold text-[#12335B]">
        Xin chào mẹ {member.name}
      </h2>

      <div className="mt-5 divide-y divide-[#EDF1F5] rounded-2xl border border-[#E4EAF0]">
        {[
          ["Họ tên", member.name],
          ["Số điện thoại", member.phone],
          ["Tỉnh thành", member.province || "Chưa cập nhật"],
          [
            "Ngày dự sinh",
            formatDisplayDate(member.dueDate) || "Chưa cập nhật",
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex items-start justify-between gap-5 px-4 py-3.5"
          >
            <span className="text-sm text-gray-500">{label}</span>

            <span className="text-right text-sm font-semibold text-[#12335B]">
              {value}
            </span>
          </div>
        ))}
      </div>

      {region && (
        <div className="mt-4 rounded-2xl bg-[#F5F9FC] px-4 py-3">
          <p className="text-xs text-gray-500">Khu vực buổi tư vấn</p>

          <p className="mt-1 text-sm font-bold text-[#12335B]">
            {region === "north" ? "Miền Bắc" : "Miền Nam"}
          </p>
        </div>
      )}
    </section>
  );
}

function formatDisplayDate(value: string) {
  if (!value) return "";

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }

  return value;
}
