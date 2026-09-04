"use client";

import { useMemo, useState } from "react";
import BenefitSection from "./components/BenefitSection";
import ClassSessionList from "./components/ClassSessionList";
import MemberInfo from "./components/MemberInfo";
import {
  CLASS_SESSIONS,
  formatClassDate,
  formatClassDateTime,
  getRegion,
  type ClassSession,
  type Region,
} from "./data/classSessions";

export type Member = {
  leadId: string;
  name: string;
  phone: string;
  province: string;
  dueDate: string;
  booking: {
    linkLopHoc: string;
    thoiGianThamDu: string;
  } | null;
  zaloUrl: string;
};

type Step = "phone" | "member" | "schedule" | "success";

export default function ConsultationPage() {
  const [phone, setPhone] = useState("");
  const [member, setMember] = useState<Member | null>(null);
  const [step, setStep] = useState<Step>("phone");
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const region: Region | null = useMemo(() => {
    if (!member?.province) return null;

    return getRegion(member.province);
  }, [member]);

  const availableClasses = useMemo(() => {
    if (!region) return [];

    return CLASS_SESSIONS.filter((item) => item.region === region);
  }, [region]);

  const handlePhoneChange = (value: string) => {
    setPhone(value.replace(/\D/g, "").slice(0, 10));
    setError("");
    setMessage("");
  };

  const handleCheckMember = async () => {
    setError("");
    setMessage("");

    if (!/^0\d{9}$/.test(phone)) {
      setError("Mẹ vui lòng nhập số điện thoại hợp lệ.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/member-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok || !data?.registered) {
        setError(
          data?.message ||
            "Không tìm thấy thông tin hội viên với số điện thoại này.",
        );
        return;
      }

      setMember(data.member);
      setSelectedClass(null);
      setStep("member");
    } catch {
      setError("Không thể kiểm tra thông tin. Mẹ vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = () => {
    setError("");
    setMessage(
      "Cảm ơn mẹ. Khi có nhu cầu tham gia lớp học, mẹ có thể đăng ký lại.",
    );
  };

  const handleAccept = () => {
    setError("");
    setMessage("");
    setSelectedClass(null);
    setStep("schedule");
  };

  const handleSelectClass = (session: ClassSession) => {
    setSelectedClass(session);
    setError("");
  };

  const handleBook = async () => {
    if (!member) return;

    if (!selectedClass) {
      setError("Mẹ vui lòng chọn một buổi học.");
      return;
    }

    setError("");
    setLoading(true);

    const thoiGianThamDu = formatClassDateTime(selectedClass);

    try {
      const response = await fetch("/api/book-class", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: member.phone,
          linkLopHoc: selectedClass.meetUrl,
          thoiGianThamDu,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.message || "Không thể đăng ký lớp học. Mẹ vui lòng thử lại.",
        );
        return;
      }

      setStep("success");
    } catch {
      setError("Không thể đăng ký lớp học lúc này. Mẹ vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPhone("");
    setMember(null);
    setStep("phone");
    setSelectedClass(null);
    setError("");
    setMessage("");
  };

  return (
    <main className="min-h-screen bg-[#F5F9FC] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-[560px]">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold text-[#12335B] sm:text-3xl">
            ĐĂNG KÝ THAM DỰ LỚP HỌC
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Quyền lợi dành riêng cho hội viên ZMOMS
          </p>
        </div>

        {step === "phone" && (
          <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-base font-bold text-[#12335B]">
              Kiểm tra thông tin hội viên
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Mẹ nhập số điện thoại đã đăng ký hội viên để kiểm tra quyền lợi.
            </p>

            <label
              htmlFor="phone"
              className="mt-5 mb-2 block text-sm font-semibold text-[#12335B]"
            >
              Số điện thoại
            </label>

            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={phone}
              maxLength={10}
              placeholder="Nhập số điện thoại"
              onChange={(e) => handlePhoneChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCheckMember();
                }
              }}
              className="h-12 w-full rounded-xl border border-[#D8E1EB] px-4 text-sm font-medium text-[#12335B] outline-none placeholder:text-gray-400 focus:border-[#18A8DC] focus:ring-2 focus:ring-[#18A8DC]/10"
            />

            {error && (
              <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleCheckMember}
              disabled={loading}
              className="mt-4 h-12 w-full rounded-xl bg-[#12335B] text-sm font-bold text-white transition hover:bg-[#0D2949] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "ĐANG KIỂM TRA..." : "KIỂM TRA THÔNG TIN"}
            </button>
          </section>
        )}

        {step === "member" && member && (
          <div className="space-y-4">
            <MemberInfo member={member} region={region} />

            <BenefitSection
              onAccept={handleAccept}
              onDecline={handleDecline}
              loading={loading}
              error={error}
              message={message}
              booking={member.booking}
              zaloUrl={member.zaloUrl}
            />
          </div>
        )}

        {step === "schedule" && member && region && (
          <ClassSessionList
            sessions={availableClasses}
            region={region}
            selectedId={selectedClass?.id || ""}
            onSelect={handleSelectClass}
            onConfirm={handleBook}
            onBack={() => {
              setError("");
              setSelectedClass(null);
              setStep("member");
            }}
            loading={loading}
            error={error}
          />
        )}

        {step === "success" && member && selectedClass && (
          <section className="rounded-3xl bg-white p-6 text-center shadow-sm sm:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F8FD] text-3xl">
              ✓
            </div>

            <h2 className="mt-5 text-xl font-extrabold text-[#12335B] sm:text-2xl">
              ĐĂNG KÝ THÀNH CÔNG!
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Mẹ đã đăng ký thành công lớp học online cùng Nữ hộ sinh.
            </p>

            <div className="mt-5 rounded-2xl bg-[#F5F9FC] p-4 text-left">
              <div className="border-b border-[#E3EAF0] pb-3">
                <p className="text-xs text-gray-500">Họ tên</p>

                <p className="mt-1 text-sm font-bold text-[#12335B]">
                  {member.name}
                </p>
              </div>

              <div className="border-b border-[#E3EAF0] py-3">
                <p className="text-xs text-gray-500">Lớp học</p>

                <p className="mt-1 text-sm font-bold text-[#12335B]">
                  {selectedClass.title}
                </p>
              </div>

              <div className="pt-3">
                <p className="text-xs text-gray-500">Thời gian</p>

                <p className="mt-1 text-sm font-bold text-[#12335B]">
                  {formatClassDate(selectedClass.date)} · {selectedClass.time}
                </p>
              </div>
            </div>

            <a
              href={selectedClass.meetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-[#18A8DC] text-sm font-bold text-white hover:bg-[#1297C8]"
            >
              THAM GIA LỚP HỌC
            </a>

            <p className="mt-4 text-xs leading-5 text-gray-500">
              Mẹ có thể lưu lại thông tin buổi học và sử dụng nút trên để tham
              gia khi đến giờ.
            </p>

            <button
              type="button"
              onClick={reset}
              className="mt-5 h-11 rounded-full border border-[#D8E1EB] px-6 text-sm font-bold text-[#12335B] hover:bg-gray-50"
            >
              HOÀN TẤT
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
