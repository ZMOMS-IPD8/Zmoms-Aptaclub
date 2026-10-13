"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import OrderManagementHeader from "./components/order-management/OrderManagementHeader";
import OrderPeriodFilter from "./components/order-management/OrderPeriodFilter";
import OrderList from "./components/order-management/OrderList";
import CreateOrderDialog from "./components/order-management/CreateOrderDialog";

type SessionResponse = {
  success: boolean;
  status?: string;
  message?: string;
  employee_id?: string;
  full_name?: string;
};

export default function CheckUserPage() {
  const router = useRouter();

  const [employeeId, setEmployeeId] = useState("");
  const [fullName, setFullName] = useState("");

  const [loadingSession, setLoadingSession] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  const logoutInProgressRef = useRef(false);

  const invalidDateRange =
    Boolean(draftStartDate && draftEndDate) && draftStartDate > draftEndDate;

  useEffect(() => {
    const controller = new AbortController();

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          router.replace("/login");
          return;
        }

        const data: unknown = await response.json();

        if (
          !data ||
          typeof data !== "object" ||
          !("success" in data) ||
          data.success !== true
        ) {
          router.replace("/login");
          return;
        }

        if (controller.signal.aborted) return;

        const session = data as SessionResponse;

        setEmployeeId(
          typeof session.employee_id === "string"
            ? session.employee_id.trim()
            : "",
        );

        setFullName(
          typeof session.full_name === "string" ? session.full_name.trim() : "",
        );
      } catch {
        if (!controller.signal.aborted) {
          router.replace("/login");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingSession(false);
        }
      }
    }

    void loadSession();

    return () => {
      controller.abort();
    };
  }, [router]);

  const handleLogout = useCallback(async () => {
    if (logoutInProgressRef.current) return;

    logoutInProgressRef.current = true;
    setLoggingOut(true);
    setLogoutError("");
    setOrderDialogOpen(false);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        setLogoutError("Đăng xuất chưa thành công. Vui lòng thử lại.");
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch {
      setLogoutError("Chưa thể đăng xuất. Vui lòng thử lại.");
    } finally {
      logoutInProgressRef.current = false;
      setLoggingOut(false);
    }
  }, [router]);

  const handleApplyDateFilter = useCallback(() => {
    if (invalidDateRange || loggingOut) return;

    setStartDate(draftStartDate);
    setEndDate(draftEndDate);
  }, [draftStartDate, draftEndDate, invalidDateRange, loggingOut]);

  const handleClearDateFilter = useCallback(() => {
    if (loggingOut) return;

    setDraftStartDate("");
    setDraftEndDate("");
    setStartDate("");
    setEndDate("");
  }, [loggingOut]);

  const handleOpenOrderDialog = useCallback(() => {
    if (loggingOut) return;

    setOrderDialogOpen(true);
  }, [loggingOut]);

  const handleCloseOrderDialog = useCallback(() => {
    setOrderDialogOpen(false);
  }, []);

  if (loadingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F9FC] px-4">
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-3 text-sm font-medium text-[#12335B]"
        >
          <span
            aria-hidden="true"
            className="h-5 w-5 animate-spin rounded-full border-2 border-[#D8E1EB] border-t-[#18A8DC]"
          />
          Đang tải thông tin tài khoản...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F9FC] px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-7xl">
        <OrderManagementHeader
          employeeId={employeeId}
          fullName={fullName}
          loggingOut={loggingOut}
          onLogout={handleLogout}
        />

        {logoutError && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {logoutError}
          </div>
        )}

        <section className="mb-6 rounded-2xl border border-[#E5EBF2] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#18A8DC]">
                Quản lý bán hàng
              </p>

              <h2 className="mt-1 text-2xl font-extrabold text-[#12335B] sm:text-3xl">
                Quản lý đơn hàng
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                Theo dõi danh sách đơn hàng, thống kê kết quả và lên đơn cho
                khách hàng đủ điều kiện.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenOrderDialog}
              disabled={loggingOut}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#12335B] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#0D2949] focus:outline-none focus:ring-4 focus:ring-[#12335B]/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span aria-hidden="true" className="text-xl leading-none">
                +
              </span>
              Lên đơn hàng
            </button>
          </div>

          <div className="mt-6 border-t border-[#E8EDF3] pt-5">
            <OrderPeriodFilter
              startDate={draftStartDate}
              endDate={draftEndDate}
              onStartDateChange={setDraftStartDate}
              onEndDateChange={setDraftEndDate}
              onApply={handleApplyDateFilter}
              onClear={handleClearDateFilter}
              loading={loggingOut}
            />
          </div>
        </section>

        <OrderList
          key={`${startDate}:${endDate}`}
          startDate={startDate}
          endDate={endDate}
        />
      </div>

      {orderDialogOpen && !loggingOut && (
        <CreateOrderDialog
          key="create-order-dialog"
          open={orderDialogOpen}
          fullName={fullName}
          onClose={handleCloseOrderDialog}
        />
      )}
    </main>
  );
}
