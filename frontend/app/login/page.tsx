"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type LoginResponse = {
  success: boolean;
  status?: string;
  message?: string;
  employee_id?: string;
  full_name?: string;
  setup_token?: string;
  setup_token_expires_in_minutes?: number;
};

export default function LoginPage() {
  const router = useRouter();

  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [error, setError] = useState("");

  async function submitLogin(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    setError("");

    if (!employeeId.trim()) {
      setError("Vui lòng nhập mã nhân viên.");
      return;
    }

    if (!password) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee_id: employeeId,
          password,
        }),
      });

      const result = (await response.json()) as LoginResponse;

      if (result.success && result.status === "LOGIN_SUCCESS") {
        router.push("/check-user");
        router.refresh();
        return;
      }

      if (
        result.status === "PASSWORD_NOT_SET" &&
        result.setup_token &&
        result.employee_id
      ) {
        const params = new URLSearchParams({
          employee_id: result.employee_id,
          token: result.setup_token,
        });

        router.push(`/set-password?${params.toString()}`);

        return;
      }

      setError(result.message || "Đăng nhập thất bại.");
    } catch {
      setError("Không thể kết nối đến hệ thống. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSetupPassword() {
    setError("");

    if (!employeeId.trim()) {
      setError("Vui lòng nhập mã nhân viên.");
      return;
    }

    setSetupLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee_id: employeeId,
          password: "",
        }),
      });

      const result = (await response.json()) as LoginResponse;

      if (
        result.status === "PASSWORD_NOT_SET" &&
        result.setup_token &&
        result.employee_id
      ) {
        const params = new URLSearchParams({
          employee_id: result.employee_id,
          token: result.setup_token,
        });

        router.push(`/set-password?${params.toString()}`);

        return;
      }

      setError(
        result.message || "Tài khoản không ở trạng thái thiết lập mật khẩu.",
      );
    } catch {
      setError("Không thể kết nối đến hệ thống. Vui lòng thử lại.");
    } finally {
      setSetupLoading(false);
    }
  }

  const isLoading = loading || setupLoading;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Đăng nhập</h1>

          <p className="mt-2 text-sm text-gray-500">
            Đăng nhập bằng mã nhân viên và mật khẩu.
          </p>
        </div>

        <form onSubmit={submitLogin} className="space-y-5">
          <div>
            <label
              htmlFor="employee_id"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Mã nhân viên
            </label>

            <input
              id="employee_id"
              type="text"
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              placeholder="Ví dụ: NV001"
              autoComplete="username"
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Mật khẩu
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-100"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !employeeId.trim() || !password}
            className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>

            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400">
                Nhân viên mới
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSetupPassword}
            disabled={isLoading || !employeeId.trim()}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {setupLoading ? "Đang kiểm tra..." : "Thiết lập mật khẩu lần đầu"}
          </button>
        </form>
      </div>
    </main>
  );
}
