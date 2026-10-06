"use client";

import { useState } from "react";

type CheckResult = {
  success: boolean;
  status?: string;
  registered?: boolean;
  purchased?: boolean;
  message?: string;
};

export default function CheckUserPage() {
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingPurchase, setUpdatingPurchase] = useState(false);

  const handlePhoneChange = (value: string) => {
    setPhone(value.replace(/\D/g, "").slice(0, 10));
    setError("");
    setResult(null);
  };

  const handleCheck = async () => {
    if (loading || updatingPurchase) {
      return;
    }

    setError("");
    setResult(null);

    const cleanPhone = phone.replace(/\D/g, "");

    if (!/^0\d{9}$/.test(cleanPhone)) {
      setError("Mẹ vui lòng nhập số điện thoại hợp lệ.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/check-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: cleanPhone,
        }),
      });

      const data = (await response.json()) as CheckResult;

      if (!response.ok || !data.success) {
        setError(
          data.message || "Không thể kiểm tra thông tin. Mẹ vui lòng thử lại.",
        );
        return;
      }

      setResult(data);
    } catch {
      setError("Có lỗi xảy ra khi kiểm tra thông tin. Mẹ vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchased = async () => {
    if (
      loading ||
      updatingPurchase ||
      !result?.registered ||
      result.purchased
    ) {
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");

    if (!/^0\d{9}$/.test(cleanPhone)) {
      setError("Mẹ vui lòng nhập số điện thoại hợp lệ.");
      return;
    }

    try {
      setUpdatingPurchase(true);
      setError("");

      const response = await fetch("/api/check-user/purchased", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: cleanPhone,
        }),
      });

      const data = (await response.json()) as CheckResult;

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Không thể cập nhật tình trạng mua hàng. Mẹ vui lòng thử lại.",
        );
        return;
      }

      setResult((current) => ({
        ...(current ?? {}),
        success: true,
        status: data.status,
        registered: true,
        purchased: true,
        message: data.message,
      }));
    } catch {
      setError(
        "Có lỗi xảy ra khi cập nhật tình trạng mua hàng. Mẹ vui lòng thử lại.",
      );
    } finally {
      setUpdatingPurchase(false);
    }
  };

  const getStatusClass = (value: boolean | undefined) => {
    return value ? "bg-[#E8F8FD] text-[#18A8DC]" : "bg-red-50 text-red-600";
  };

  return (
    <main className="min-h-screen bg-[#F5F9FC] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-[560px]">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold leading-tight text-[#12335B] sm:text-3xl">
            KIỂM TRA THÔNG TIN
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Kiểm tra thông tin đăng ký và mua hàng
          </p>
        </div>

        <section className="w-full rounded-3xl bg-white p-5 shadow-sm sm:p-8">
          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-semibold text-[#12335B]"
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
              disabled={loading || updatingPurchase}
              placeholder="Nhập số điện thoại"
              onChange={(e) => handlePhoneChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCheck();
                }
              }}
              className="h-12 w-full rounded-xl border border-[#D8E1EB] px-4 text-sm font-medium text-[#12335B] outline-none placeholder:text-gray-400 focus:border-[#18A8DC] focus:ring-2 focus:ring-[#18A8DC]/10 disabled:bg-gray-100"
            />
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3">
              <p className="text-sm font-medium leading-5 text-red-600">
                {error}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleCheck}
            disabled={loading || updatingPurchase}
            className="mt-5 h-12 w-full rounded-xl bg-[#12335B] text-sm font-bold text-white transition hover:bg-[#0D2949] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "ĐANG KIỂM TRA..." : "KIỂM TRA"}
          </button>

          {result && (
            <div className="mt-6 rounded-2xl bg-[#F8FBFD] p-4">
              <p className="mb-4 text-center text-sm font-bold text-[#12335B]">
                KẾT QUẢ KIỂM TRA
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#E3EAF0] bg-white px-4 py-4">
                  <span className="text-sm font-semibold text-[#12335B]">
                    Đăng ký hội viên
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                      result.registered,
                    )}`}
                  >
                    {result.registered ? "ĐÃ ĐĂNG KÝ" : "CHƯA ĐĂNG KÝ"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#E3EAF0] bg-white px-4 py-4">
                  <span className="text-sm font-semibold text-[#12335B]">
                    Tình trạng mua hàng
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                      result.purchased,
                    )}`}
                  >
                    {result.purchased ? "ĐÃ MUA HÀNG" : "CHƯA MUA HÀNG"}
                  </span>
                </div>
              </div>

              {result.registered && !result.purchased && (
                <button
                  type="button"
                  onClick={handlePurchased}
                  disabled={updatingPurchase}
                  className="mt-4 h-12 w-full rounded-xl bg-[#18A8DC] text-sm font-bold text-white transition hover:bg-[#1099CB] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updatingPurchase ? "ĐANG CẬP NHẬT..." : "ĐÃ MUA"}
                </button>
              )}

              <div className="mt-4 rounded-xl bg-white px-4 py-3 text-center">
                {result.registered && result.purchased && (
                  <p className="text-sm font-semibold text-[#18A8DC]">
                    Mẹ đã đăng ký hội viên và đã mua hàng thành công.
                  </p>
                )}

                {result.registered && !result.purchased && (
                  <p className="text-sm font-medium leading-5 text-gray-600">
                    Mẹ đã đăng ký hội viên nhưng chưa có đơn hàng giao thành
                    công.
                  </p>
                )}

                {!result.registered && (
                  <p className="text-sm font-medium leading-5 text-gray-600">
                    Số điện thoại này chưa có thông tin đăng ký hội viên.
                  </p>
                )}
              </div>
            </div>
          )}

          <p className="mt-5 text-center text-xs leading-5 text-gray-400">
            Vui lòng nhập đúng số điện thoại để kiểm tra thông tin.
          </p>
        </section>
      </div>
    </main>
  );
}
