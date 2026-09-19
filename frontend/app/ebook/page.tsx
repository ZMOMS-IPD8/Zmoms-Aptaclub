"use client";

import { useState } from "react";

export default function EbookPage() {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (value: string) => {
    setPhone(value.replace(/\D/g, "").slice(0, 10));
    setError("");
  };

  const handleSubmit = async () => {
    if (loading) {
      return;
    }

    setError("");

    if (!/^0\d{9}$/.test(phone)) {
      setError("Mẹ vui lòng nhập số điện thoại hợp lệ.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Mẹ vui lòng nhập email hợp lệ.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/ebook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          email,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(
          result.message || "Không thể nhận Ebook. Mẹ vui lòng thử lại.",
        );
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Có lỗi xảy ra. Mẹ vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#F5F9FC] px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[560px] items-center justify-center">
          <section className="w-full rounded-3xl bg-white p-6 text-center shadow-sm sm:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F8FD] text-3xl text-[#18A8DC]">
              ✓
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-wide text-[#18A8DC]">
              QL 3
            </p>

            <h1 className="mt-2 text-xl font-extrabold leading-tight text-[#12335B] sm:text-2xl">
              MẸ ĐÃ ĐĂNG KÝ NHẬN EBOOK
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Ebook sẽ được chia sẻ đến email của mẹ.
            </p>

            <div className="mt-5 rounded-2xl bg-[#F5F9FC] px-4 py-4">
              <p className="text-xs text-gray-500">Ebook</p>

              <p className="mt-1 text-sm font-bold leading-6 text-[#12335B]">
                PHƯƠNG PHÁP TRÒ CHUYỆN GIÚP KÍCH HOẠT NÃO BỘ KHI BÉ BÚ MẸ
              </p>

              <div className="mt-4 border-t border-[#E3EAF0] pt-4">
                <p className="text-xs text-gray-500">Email nhận Ebook</p>

                <p className="mt-1 break-all text-sm font-bold text-[#12335B]">
                  {email}
                </p>
              </div>
            </div>

            <p className="mt-5 text-xs leading-5 text-gray-500">
              Mẹ vui lòng kiểm tra hộp thư đến và cả thư mục Spam/Quảng cáo nếu
              chưa thấy email.
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F9FC] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[560px] items-center justify-center">
        <section className="w-full rounded-3xl bg-white p-5 shadow-sm sm:p-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-[#18A8DC]">
              QL 3
            </p>

            <h1 className="mt-2 text-2xl font-extrabold leading-tight text-[#12335B] sm:text-3xl">
              PHƯƠNG PHÁP TRÒ CHUYỆN GIÚP KÍCH HOẠT NÃO BỘ KHI BÉ BÚ MẸ
            </h1>

            <p className="mx-auto mt-3 max-w-[440px] text-sm leading-6 text-gray-500">
              Ebook IPD8 chia sẻ phương pháp trò chuyện giúp mẹ tăng cường tương
              tác và đồng hành cùng bé trong thời gian bú mẹ.
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#E8F8FD] to-[#F5F9FC] p-5">
            <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-white/80 bg-white/70 px-5 py-6 text-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#18A8DC]">
                  EBOOK IPD8
                </p>

                <p className="mt-2 text-lg font-extrabold leading-7 text-[#12335B] sm:text-xl">
                  PHƯƠNG PHÁP TRÒ CHUYỆN
                  <br />
                  GIÚP KÍCH HOẠT NÃO BỘ
                  <br />
                  KHI BÉ BÚ MẸ
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
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
                disabled={loading}
                placeholder="Nhập số điện thoại đã đăng ký hội viên"
                onChange={(e) => handlePhoneChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit();
                  }
                }}
                className="h-12 w-full rounded-xl border border-[#D8E1EB] px-4 text-sm font-medium text-[#12335B] outline-none placeholder:text-gray-400 focus:border-[#18A8DC] focus:ring-2 focus:ring-[#18A8DC]/10 disabled:bg-gray-100"
              />
            </div>

            <div className="mt-5">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#12335B]"
              >
                Email nhận Ebook
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                disabled={loading}
                placeholder="Nhập email của mẹ"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit();
                  }
                }}
                className="h-12 w-full rounded-xl border border-[#D8E1EB] px-4 text-sm font-medium text-[#12335B] outline-none placeholder:text-gray-400 focus:border-[#18A8DC] focus:ring-2 focus:ring-[#18A8DC]/10 disabled:bg-gray-100"
              />
            </div>

            {error && (
              <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="mt-5 h-12 w-full rounded-xl bg-[#12335B] text-sm font-bold text-white transition hover:bg-[#0D2949] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "ĐANG XỬ LÝ..." : "NHẬN EBOOK"}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-gray-400">
              Ebook sẽ được chia sẻ đến email mẹ đã cung cấp.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
