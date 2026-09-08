"use client";

import { useState } from "react";
import type { Member } from "../page";

type Props = {
  member: Member;
  loading: boolean;
  error: string;
  onComplete: () => void;
  onBack: () => void;
  onLoadingChange: (loading: boolean) => void;
  onError: (error: string) => void;
};

export default function BathReview({
  member,
  loading,
  error,
  onComplete,
  onBack,
  onLoadingChange,
  onError,
}: Props) {
  const [staffName, setStaffName] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    onError("");

    if (!staffName.trim()) {
      onError("Mẹ vui lòng nhập tên nhân viên chăm sóc.");
      return;
    }

    onLoadingChange(true);

    try {
      const response = await fetch("/api/bath-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId: member.leadId,
          phone: member.phone,
          review: {
            staffName: staffName.trim(),
            notes: notes.trim(),
          },
        }),
      });

      const data = await response.json();

      if (response.status === 409) {
        onError(
          data?.message ||
            "Mẹ đã hoàn tất thông tin sau buổi chăm sóc trước đó.",
        );
        return;
      }

      if (!response.ok) {
        onError(
          data?.message || "Không thể lưu thông tin. Mẹ vui lòng thử lại.",
        );
        return;
      }

      onComplete();
    } catch {
      onError("Không thể gửi thông tin lúc này. Mẹ vui lòng thử lại.");
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
      <p className="text-xs font-bold uppercase tracking-wide text-[#18A8DC]">
        Cập nhật sau buổi chăm sóc
      </p>

      <h2 className="mt-1 text-xl font-extrabold text-[#12335B]">
        Mẹ chia sẻ thông tin sau buổi chăm sóc
      </h2>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        Mẹ vui lòng cập nhật tên nhân viên đã chăm sóc và ghi chú sau buổi tư
        vấn, chăm sóc tại nhà.
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="staff-name"
            className="text-sm font-semibold leading-6 text-[#12335B]"
          >
            Tên nhân viên chăm sóc
          </label>

          <input
            id="staff-name"
            type="text"
            value={staffName}
            onChange={(e) => {
              onError("");
              setStaffName(e.target.value);
            }}
            placeholder="Nhập tên nhân viên"
            className="mt-3 h-12 w-full rounded-xl border border-[#D8E1EB] px-4 text-sm text-[#12335B] outline-none placeholder:text-gray-400 focus:border-[#18A8DC] focus:ring-2 focus:ring-[#18A8DC]/10"
          />
        </div>

        <div>
          <label
            htmlFor="bath-notes"
            className="text-sm font-semibold leading-6 text-[#12335B]"
          >
            Ghi chú sau buổi chăm sóc
          </label>

          <textarea
            id="bath-notes"
            value={notes}
            onChange={(e) => {
              onError("");
              setNotes(e.target.value);
            }}
            placeholder="Mẹ có thể chia sẻ tình trạng của bé, cảm nhận hoặc ghi chú sau buổi chăm sóc"
            rows={5}
            className="mt-3 w-full rounded-xl border border-[#D8E1EB] px-4 py-3 text-sm text-[#12335B] outline-none placeholder:text-gray-400 focus:border-[#18A8DC] focus:ring-2 focus:ring-[#18A8DC]/10"
          />
        </div>
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
        className="mt-6 h-12 w-full rounded-xl bg-[#12335B] text-sm font-bold text-white transition hover:bg-[#0D2949] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "ĐANG GỬI..." : "HOÀN TẤT"}
      </button>

      <button
        type="button"
        onClick={onBack}
        disabled={loading}
        className="mt-3 h-10 w-full text-sm font-bold text-gray-500 hover:text-[#12335B]"
      >
        ← Quay lại
      </button>
    </section>
  );
}
