"use client";

import { useState } from "react";
import { validateReferralCode } from "../data/referralCodes";

type Props = {
  onVerified: (phone: string, referralCode: string) => void;
};

export default function ReferralVerification({ onVerified }: Props) {
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [zaloUrl, setZaloUrl] = useState("");

  const [showNotRegistered, setShowNotRegistered] = useState(false);
  const [showAlreadyPurchased, setShowAlreadyPurchased] = useState(false);

  const normalizePhone = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 10);
  };

  const handlePhoneChange = (value: string) => {
    setPhone(normalizePhone(value));
    setError("");
  };

  const handleReferralChange = (value: string) => {
    setReferralCode(value.toUpperCase().replace(/\s/g, ""));
    setError("");
  };

  const handleVerify = async () => {
    setError("");

    const normalizedReferralCode = referralCode.trim().toUpperCase();

    if (!phone) {
      setError("Mẹ vui lòng nhập số điện thoại.");
      return;
    }

    if (!/^0\d{9}$/.test(phone)) {
      setError("Số điện thoại không đúng định dạng. Mẹ vui lòng kiểm tra lại.");
      return;
    }

    if (!normalizedReferralCode) {
      setError("Mẹ vui lòng nhập mã giới thiệu.");
      return;
    }

    if (!validateReferralCode(normalizedReferralCode)) {
      setError("Mã giới thiệu không hợp lệ. Mẹ vui lòng kiểm tra lại.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/check-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          referralCode: normalizedReferralCode,
        }),
      });

      const data = await response.json();

      if (data.zaloUrl) {
        setZaloUrl(data.zaloUrl);
      }

      if (!response.ok || !data.registered) {
        setShowNotRegistered(true);
        return;
      }

      if (data.purchased) {
        setShowAlreadyPurchased(true);
        return;
      }

      onVerified(phone, normalizedReferralCode);
    } catch {
      setError("Không thể kiểm tra thông tin lúc này. Mẹ vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section
        id="referral-code"
        className="mt-5 rounded-2xl border border-[#D8E1EB] bg-white p-4 shadow-sm sm:p-5"
      >
        <div>
          <h3 className="text-sm font-bold text-[#12335B] sm:text-base">
            KÍCH HOẠT ƯU ĐÃI
          </h3>

          <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
            Mẹ nhập số điện thoại Zalo đã đăng ký và mã giới thiệu để nhận ưu
            đãi giảm 300.000đ.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-xs font-semibold text-[#12335B]"
            >
              Số điện thoại Zalo đã đăng ký
            </label>

            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="Nhập số điện thoại"
              maxLength={10}
              className="h-12 w-full rounded-xl border border-[#D8E1EB] bg-white px-4 text-sm font-medium text-[#12335B] outline-none transition placeholder:text-gray-400 focus:border-[#18A8DC] focus:ring-2 focus:ring-[#18A8DC]/10"
            />
          </div>

          <div>
            <label
              htmlFor="referralCode"
              className="mb-1.5 block text-xs font-semibold text-[#12335B]"
            >
              Mã giới thiệu
            </label>

            <input
              id="referralCode"
              type="text"
              autoComplete="off"
              value={referralCode}
              onChange={(e) => handleReferralChange(e.target.value)}
              placeholder="Nhập Mã giới thiệu"
              className="h-12 w-full rounded-xl border border-[#D8E1EB] bg-white px-4 text-sm font-medium uppercase tracking-wide text-[#12335B] outline-none transition placeholder:text-gray-400 focus:border-[#18A8DC] focus:ring-2 focus:ring-[#18A8DC]/10"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3">
              <p className="text-xs font-medium leading-5 text-red-600">
                {error}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleVerify}
            disabled={loading}
            className="h-12 w-full rounded-xl bg-[#12335B] px-6 text-sm font-bold text-white transition hover:bg-[#0D2949] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "ĐANG KIỂM TRA..." : "KIỂM TRA VÀ NHẬN ƯU ĐÃI"}
          </button>
        </div>
      </section>

      {showNotRegistered && (
        <NotRegisteredModal
          zaloUrl={zaloUrl}
          onRegister={() => {
            if (zaloUrl) {
              window.location.href = zaloUrl;
            }
          }}
          onClose={() => {
            setShowNotRegistered(false);
          }}
        />
      )}

      {showAlreadyPurchased && (
        <AlreadyPurchasedModal
          onClose={() => {
            setShowAlreadyPurchased(false);
          }}
        />
      )}
    </>
  );
}

function NotRegisteredModal({
  zaloUrl,
  onRegister,
  onClose,
}: {
  zaloUrl: string;
  onRegister: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="not-registered-title"
    >
      <div className="w-full max-w-[420px] rounded-3xl bg-white p-6 shadow-xl sm:p-7">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF5E3] text-2xl font-bold text-[#F5A623]">
          !
        </div>

        <h3
          id="not-registered-title"
          className="mt-4 text-center text-lg font-extrabold text-[#12335B]"
        >
          Chưa tìm thấy thông tin
        </h3>

        <p className="mt-2 text-center text-sm leading-6 text-gray-600">
          Số điện thoại mẹ nhập chưa có thông tin đăng ký thành viên trên hệ
          thống.
        </p>

        <p className="mt-2 text-center text-sm font-semibold leading-6 text-[#12335B]">
          Mẹ vui lòng quan tâm Zalo OA Aptaclub và để lại số điện thoại Zalo để
          đăng ký thành viên.
        </p>

        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full border border-[#D8E1EB] px-5 py-3 text-sm font-bold text-[#12335B] transition hover:bg-gray-50"
          >
            KIỂM TRA LẠI
          </button>

          <button
            type="button"
            onClick={onRegister}
            disabled={!zaloUrl}
            className="w-full rounded-full bg-[#F5A623] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#E89512] disabled:cursor-not-allowed disabled:opacity-60"
          >
            QUAN TÂM OA ĐỂ ĐĂNG KÝ
          </button>
        </div>
      </div>
    </div>
  );
}

function AlreadyPurchasedModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="already-purchased-title"
    >
      <div className="w-full max-w-[420px] rounded-3xl bg-white p-6 shadow-xl sm:p-7">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF0F8] text-xl font-bold text-[#EC008C]">
          ✓
        </div>

        <h3
          id="already-purchased-title"
          className="mt-4 text-center text-lg font-extrabold text-[#12335B]"
        >
          Ưu đãi đã được sử dụng
        </h3>

        <p className="mt-2 text-center text-sm leading-6 text-gray-600">
          Số điện thoại này đã được sử dụng để nhận ưu đãi trước đó.
        </p>

        <p className="mt-2 text-center text-sm font-semibold leading-6 text-[#12335B]">
          Mỗi số điện thoại chỉ được áp dụng ưu đãi một lần.
        </p>

        <div className="mt-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-[#12335B] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0D2949]"
          >
            ĐÃ HIỂU
          </button>
        </div>
      </div>
    </div>
  );
}
