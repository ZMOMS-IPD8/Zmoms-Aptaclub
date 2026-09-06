"use client";

import { useState } from "react";
import type { Member } from "../page";
import PostSurveyGroupChoice from "./PostSurveyGroupChoice";

type Props = {
  member: Member;
  onComplete: () => void;
  onBack: () => void;
};

export default function PostSurvey({ member, onComplete, onBack }: Props) {
  const [rating, setRating] = useState("");
  const [group, setGroup] = useState("");
  const [careAtHome, setCareAtHome] = useState("");
  const [votingName, setVotingName] = useState("");
  const [feedback, setFeedback] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (!rating) {
      setError("Mẹ vui lòng đánh giá buổi học.");
      return;
    }

    if (!group) {
      setError("Mẹ vui lòng chọn mức độ phù hợp với mình.");
      return;
    }

    if (!careAtHome) {
      setError(
        "Mẹ vui lòng cho biết mẹ có nhu cầu được hỗ trợ chăm sóc tại nhà không.",
      );
      return;
    }

    if (!votingName.trim()) {
      setError("Mẹ vui lòng nhập tên bác sĩ/chuyên gia mẹ muốn bình chọn.");
      return;
    }

    setLoading(true);

    const survey = {
      submittedAt: new Date().toISOString(),

      member: {
        name: member.name,
        phone: member.phone,
        leadId: member.leadId,
      },

      booking: member.booking
        ? {
            linkLopHoc: member.booking.linkLopHoc,
            thoiGianThamDu: member.booking.thoiGianThamDu,
          }
        : null,

      danhGia: {
        rating,
        group,
        careAtHome,
        feedback: feedback.trim(),
      },

      voting: {
        name: votingName.trim(),
      },
    };

    try {
      const response = await fetch("/api/post-survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId: member.leadId,
          survey,
        }),
      });

      const data = await response.json();

      if (response.status === 409) {
        setError(data?.message || "Mẹ đã hoàn thành khảo sát trước đó.");

        return;
      }

      if (!response.ok) {
        setError(
          data?.message || "Không thể lưu khảo sát. Mẹ vui lòng thử lại.",
        );
        return;
      }

      onComplete();
    } catch {
      setError("Không thể gửi khảo sát lúc này. Mẹ vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
      <p className="text-xs font-bold uppercase tracking-wide text-[#18A8DC]">
        Khảo sát sau buổi học
      </p>

      <h2 className="mt-1 text-xl font-extrabold text-[#12335B]">
        Mẹ chia sẻ cảm nhận sau buổi học
      </h2>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        Những chia sẻ của mẹ giúp IPD8 hiểu hơn về trải nghiệm thực tế và nhu
        cầu hỗ trợ sau buổi tư vấn.
      </p>

      <div className="mt-6 space-y-6">
        <RadioGroup
          label="Mẹ đánh giá buổi học hôm nay như thế nào?"
          value={rating}
          options={[
            "1 - Chưa hài lòng",
            "2 - Chưa thực sự hài lòng",
            "3 - Hài lòng",
            "4 - Rất hài lòng",
            "5 - Hoàn toàn hài lòng",
          ]}
          onChange={setRating}
        />

        <PostSurveyGroupChoice value={group} onChange={setGroup} />

        <RadioGroup
          label="Sau buổi học, mẹ có nhu cầu được hỗ trợ chăm sóc tại nhà không?"
          value={careAtHome}
          options={["Có", "Không"]}
          onChange={setCareAtHome}
        />

        <TextInput
          label="Mẹ muốn bình chọn bác sĩ/chuyên gia nào?"
          value={votingName}
          onChange={setVotingName}
          placeholder="Mẹ nhập tên bác sĩ/chuyên gia"
        />

        <TextInput
          label="Mẹ có muốn chia sẻ thêm điều gì sau buổi học không?"
          value={feedback}
          onChange={setFeedback}
          placeholder="Mẹ có thể chia sẻ cảm nhận, góp ý hoặc điều mẹ mong muốn được hỗ trợ thêm"
          multiline
        />
      </div>

      {error && (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="mt-6 h-12 w-full rounded-xl bg-[#12335B] text-sm font-bold text-white hover:bg-[#0D2949] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "ĐANG GỬI..." : "HOÀN TẤT KHẢO SÁT"}
      </button>

      <button
        type="button"
        onClick={onBack}
        disabled={loading}
        className="mt-3 h-10 w-full text-sm font-bold text-gray-500 hover:text-[#12335B]"
      >
        Quay lại
      </button>
    </section>
  );
}

function RadioGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold leading-6 text-[#12335B]">{label}</p>

      <div className="mt-3 space-y-2">
        {options.map((option) => {
          const selected = value === option;

          return (
            <label
              key={option}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                selected
                  ? "border-[#18A8DC] bg-[#F0FAFD]"
                  : "border-[#D8E1EB] hover:border-[#18A8DC]"
              }`}
            >
              <input
                type="radio"
                name={label}
                value={option}
                checked={selected}
                onChange={(e) => onChange(e.target.value)}
                className="mt-1"
              />

              <span className="text-sm leading-5 text-gray-700">{option}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-semibold leading-6 text-[#12335B]">
        {label}
      </label>

      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="mt-3 w-full rounded-xl border border-[#D8E1EB] px-4 py-3 text-sm text-[#12335B] outline-none placeholder:text-gray-400 focus:border-[#18A8DC] focus:ring-2 focus:ring-[#18A8DC]/10"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-3 h-12 w-full rounded-xl border border-[#D8E1EB] px-4 text-sm text-[#12335B] outline-none placeholder:text-gray-400 focus:border-[#18A8DC] focus:ring-2 focus:ring-[#18A8DC]/10"
        />
      )}
    </div>
  );
}
