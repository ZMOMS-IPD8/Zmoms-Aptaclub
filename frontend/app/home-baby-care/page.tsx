"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhoneCheck from "./components/PhoneCheck";
import BathBooking from "./components/BathBooking";
import BathReview from "./components/BathReview";
import Success from "./components/Success";

export type Member = {
  leadId: string;
  name: string;
  phone: string;
  province?: string;
  dueDate?: string;
};

export type BathBookingData = {
  address: string;
  date: string;
  time: string;
};

type Step = "phone" | "booking" | "success" | "review";

export default function HomeBabyCarePage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [member, setMember] = useState<Member | null>(null);
  const [booking, setBooking] = useState<BathBookingData | null>(null);
  const [step, setStep] = useState<Step>("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePhoneChange = (value: string) => {
    setPhone(value.replace(/\D/g, "").slice(0, 10));
    setError("");
  };

  const handleCheckMember = async () => {
    setError("");

    if (!/^0\d{9}$/.test(phone)) {
      setError("Mẹ vui lòng nhập số điện thoại hợp lệ.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/bath-member-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.registered || !data?.member) {
        setError(
          data?.message ||
            "Không tìm thấy thông tin hội viên với số điện thoại này.",
        );
        return;
      }

      const nextMember: Member = {
        leadId: String(data.member.leadId ?? ""),
        name: String(data.member.name ?? ""),
        phone: String(data.member.phone ?? phone),
        province: data.member.province
          ? String(data.member.province)
          : undefined,
        dueDate: data.member.dueDate ? String(data.member.dueDate) : undefined,
      };

      setMember(nextMember);

      if (data.bathBooking) {
        setBooking({
          address: String(data.bathBooking.address ?? ""),
          date: String(data.bathBooking.date ?? ""),
          time: String(data.bathBooking.time ?? ""),
        });

        setStep("success");
      } else {
        setBooking(null);
        setStep("booking");
      }
    } catch {
      setError("Không thể kiểm tra thông tin. Mẹ vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookingComplete = (data: BathBookingData) => {
    setBooking(data);
    setError("");
    setStep("success");
  };

  const handleReviewComplete = () => {
    setError("");
    setStep("success");
  };

  return (
    <main className="min-h-screen bg-[#F5F9FC] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-[560px]">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold text-[#12335B] sm:text-3xl">
            ĐĂNG KÝ BUỔI TƯ VẤN VÀ CHĂM SÓC RIÊNG MẸ VÀ BÉ TẠI NHÀ (45 PHÚT)
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            QUYỀN LỢI 2 DÀNH CHO HỘI VIÊN CLB
          </p>
        </div>

        {step === "phone" && (
          <PhoneCheck
            phone={phone}
            loading={loading}
            error={error}
            onChange={handlePhoneChange}
            onSubmit={handleCheckMember}
            onRegister={() => router.push("/")}
          />
        )}

        {step === "booking" && member && (
          <BathBooking
            member={member}
            loading={loading}
            error={error}
            onComplete={handleBookingComplete}
            onBack={() => {
              setError("");
              setStep("phone");
            }}
            onLoadingChange={setLoading}
            onError={setError}
          />
        )}

        {step === "success" && member && booking && (
          <Success
            member={member}
            booking={booking}
            onReview={() => {
              setError("");
              setStep("review");
            }}
          />
        )}

        {step === "review" && member && (
          <BathReview
            member={member}
            loading={loading}
            error={error}
            onComplete={handleReviewComplete}
            onBack={() => {
              setError("");
              setStep("success");
            }}
            onLoadingChange={setLoading}
            onError={setError}
          />
        )}
      </div>
    </main>
  );
}
