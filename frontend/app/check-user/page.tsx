"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OrderForm from "../check-user/components/check-user/OrderForm";
import { useOrder } from "../check-user/hooks/useOrder";

type SessionResponse = {
  success: boolean;
  status?: string;
  message?: string;
  employee_id?: string;
  full_name?: string;
};

type CheckResult = {
  success: boolean;
  status?: string;
  registered?: boolean;
  purchased?: boolean;
  purchasedWithoutRegistration?: boolean;
  deliveryStatus?: string;
  message?: string;
};

export default function CheckUserPage() {
  const router = useRouter();

  const [employeeId, setEmployeeId] = useState("");
  const [fullName, setFullName] = useState("");

  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState("");

  const [loadingSession, setLoadingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [orderingMode, setOrderingMode] = useState(false);

  const [receiverName, setReceiverName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");

  const {
    ordering,
    ordered,
    error: orderError,
    setError: setOrderError,
    submitOrder,
  } = useOrder();

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
          cache: "no-store",
        });

        const data = (await response.json()) as SessionResponse;

        if (!response.ok || !data.success) {
          router.replace("/login");
          return;
        }

        setEmployeeId(data.employee_id || "");
        setFullName(data.full_name || "");
      } catch {
        router.replace("/login");
      } finally {
        setLoadingSession(false);
      }
    }

    loadSession();
  }, [router]);

  const handlePhoneChange = (value: string) => {
    if (orderingMode) {
      return;
    }

    const cleanPhone = value.replace(/\D/g, "").slice(0, 10);

    setPhone(cleanPhone);
    setError("");
    setResult(null);
    setOrderingMode(false);

    setReceiverName("");
    setShippingPhone("");
    setShippingAddress("");
    setOrderError("");
  };

  const handleCheck = async () => {
    if (loading || ordering) {
      return;
    }

    setError("");
    setOrderError("");
    setResult(null);
    setOrderingMode(false);

    setReceiverName("");
    setShippingPhone("");
    setShippingAddress("");

    const cleanPhone = phone.replace(/\D/g, "");

    if (!/^0\d{9}$/.test(cleanPhone)) {
      setError("Vui lòng nhập số điện thoại hợp lệ.");
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
        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        setError(
          data.message || "Không thể kiểm tra thông tin. Vui lòng thử lại.",
        );

        return;
      }

      setResult(data);
    } catch {
      setError("Có lỗi xảy ra khi kiểm tra thông tin. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartOrder = () => {
    if (!result?.registered || ordering) {
      return;
    }

    setError("");
    setOrderError("");
    setShippingPhone(phone);
    setOrderingMode(true);
  };

  const handleSubmitOrder = async () => {
    if (ordering || !result?.registered || !fullName) {
      return;
    }

    setError("");
    setOrderError("");

    const orderResult = await submitOrder({
      registrationPhone: phone,
      receiverName,
      shippingPhone,
      shippingAddress,
      maNguoiBan: fullName,
    });

    if (!orderResult?.success) {
      return;
    }
  };

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  const getStatusClass = (value: boolean | undefined) => {
    return value ? "bg-[#E8F8FD] text-[#18A8DC]" : "bg-red-50 text-red-600";
  };

  if (loadingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F9FC] px-4">
        <div className="text-sm font-medium text-[#12335B]">Đang tải...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F9FC] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-[560px]">
        <header className="mb-6 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Tài khoản nhân viên
              </p>

              <h1 className="mt-1 truncate text-xl font-extrabold text-[#12335B] sm:text-2xl">
                Xin chào{fullName ? `, ${fullName}` : ""}
              </h1>

              {employeeId && (
                <p className="mt-1 text-sm text-gray-500">
                  Mã nhân viên:{" "}
                  <span className="font-semibold text-[#12335B]">
                    {employeeId}
                  </span>
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="shrink-0 rounded-lg border border-[#D8E1EB] px-3 py-2 text-xs font-semibold text-[#12335B] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loggingOut ? "Đang thoát..." : "Đăng xuất"}
            </button>
          </div>
        </header>

        <section className="w-full rounded-3xl bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-extrabold leading-tight text-[#12335B] sm:text-3xl">
              KIỂM TRA THÔNG TIN
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Kiểm tra thông tin đăng ký và đặt hàng
            </p>
          </div>

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
              disabled={loading || ordering || orderingMode || ordered}
              placeholder="Nhập số điện thoại"
              onChange={(event) => handlePhoneChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !orderingMode && !ordered) {
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
            disabled={loading || ordering || orderingMode || ordered}
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
              </div>

              {result.purchasedWithoutRegistration && (
                <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3">
                  <p className="text-sm font-bold leading-5 text-amber-700">
                    Đã mua hàng nhưng chưa đăng ký hội viên.
                  </p>

                  <p className="mt-1 text-sm leading-5 text-amber-600">
                    Vui lòng hướng dẫn khách hàng đăng ký hội viên để được cập
                    nhật thông tin và hưởng quyền lợi dành cho hội viên.
                  </p>
                </div>
              )}

              {result.registered && !orderingMode && !ordered && (
                <button
                  type="button"
                  onClick={handleStartOrder}
                  disabled={ordering}
                  className="mt-4 h-12 w-full rounded-xl bg-[#18A8DC] text-sm font-bold text-white transition hover:bg-[#1099CB] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  ĐẶT HÀNG
                </button>
              )}

              {orderingMode && !ordered && (
                <OrderForm
                  receiverName={receiverName}
                  shippingPhone={shippingPhone}
                  shippingAddress={shippingAddress}
                  disabled={ordering}
                  loading={ordering}
                  error={orderError}
                  onReceiverNameChange={setReceiverName}
                  onShippingPhoneChange={setShippingPhone}
                  onShippingAddressChange={setShippingAddress}
                  onSubmit={handleSubmitOrder}
                />
              )}

              {ordered && (
                <div className="mt-4 rounded-xl bg-[#E8F8FD] px-4 py-4">
                  <p className="text-sm font-bold leading-5 text-[#18A8DC]">
                    ĐẶT HÀNG THÀNH CÔNG
                  </p>

                  <p className="mt-1 text-sm leading-5 text-[#18A8DC]">
                    Thông tin nhận hàng đã được cập nhật thành công trên hệ
                    thống.
                  </p>
                </div>
              )}

              {!result.registered &&
                !result.purchased &&
                !result.purchasedWithoutRegistration && (
                  <p className="mt-4 text-sm font-medium leading-5 text-gray-600">
                    Số điện thoại này chưa có thông tin đăng ký hội viên.
                  </p>
                )}
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
