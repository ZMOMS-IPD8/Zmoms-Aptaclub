"use client";

type Props = {
  status: "checking" | "alreadyPurchased" | "denied" | "success";
  zaloUrl?: string;
};

export default function PaymentStatus({ status, zaloUrl = "" }: Props) {
  if (status === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFAF5] px-4">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#12335B]/20 border-t-[#12335B]" />

          <p className="mt-4 text-sm font-medium text-gray-500">
            Đang kiểm tra thông tin đơn hàng...
          </p>
        </div>
      </main>
    );
  }

  if (status === "alreadyPurchased") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFAF5] px-4 py-8">
        <section className="w-full max-w-[560px] rounded-3xl bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 12.5L9.5 17L19 7.5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-600"
              />
            </svg>
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-[#12335B]">
            Mẹ đã đặt hàng
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Thông tin đơn hàng của mẹ đã được ghi nhận trước đó.
          </p>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Mẹ vui lòng nhắn tin qua Zalo OA của Zmoms để được cập nhật tình
            trạng đơn hàng.
          </p>

          {zaloUrl && (
            <a
              href={zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex w-full items-center justify-center rounded-full bg-[#12335B] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#0D2949]"
            >
              NHẮN TIN QUA ZALO OA
            </a>
          )}
        </section>
      </main>
    );
  }

  if (status === "denied") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFAF5] px-4">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500">
            Thông tin truy cập không hợp lệ.
          </p>
        </div>
      </main>
    );
  }

  if (status === "success") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFAF5] px-4 py-8">
        <section className="w-full max-w-[560px] rounded-3xl bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 12.5L9.5 17L19 7.5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-600"
              />
            </svg>
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-[#12335B] sm:text-3xl">
            ĐẶT HÀNG THÀNH CÔNG
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Thông tin đơn hàng của mẹ đã được ghi nhận.
          </p>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Mẹ vui lòng nhắn tin qua Zalo OA của Zmoms để được cập nhật tình
            trạng đơn hàng.
          </p>

          {zaloUrl && (
            <a
              href={zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex w-full items-center justify-center rounded-full bg-[#12335B] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#0D2949]"
            >
              NHẮN TIN QUA ZALO OA
            </a>
          )}
        </section>
      </main>
    );
  }

  return null;
}
