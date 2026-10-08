"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type SetPasswordResponse = {
  success: boolean;
  status?: string;
  message?: string;
  employee_id?: string;
  full_name?: string;
};

export default function SetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setupToken = searchParams.get("token") || "";
  const employeeId = searchParams.get("employee_id") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!setupToken || !employeeId) {
      setError("Thông tin thiết lập mật khẩu không hợp lệ hoặc đã hết hạn.");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee_id: employeeId,
          password,
          setup_token: setupToken,
        }),
      });

      const result = (await response.json()) as SetPasswordResponse;

      if (result.success && result.status === "PASSWORD_SET") {
        router.push("/check-user");
        router.refresh();
        return;
      }

      setError(
        result.message || "Không thể thiết lập mật khẩu. Vui lòng thử lại.",
      );
    } catch {
      setError("Không thể kết nối đến hệ thống. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Thiết lập mật khẩu
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Tạo mật khẩu để sử dụng tài khoản nhân viên.
          </p>

          {employeeId && (
            <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
              Mã nhân viên:{" "}
              <span className="font-medium text-gray-900">{employeeId}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Mật khẩu mới
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Nhập mật khẩu mới"
              autoComplete="new-password"
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Xác nhận mật khẩu
            </label>

            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
              disabled={loading}
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
            disabled={loading || !password || !confirmPassword}
            className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Đang thiết lập..." : "Thiết lập mật khẩu"}
          </button>
        </form>
      </div>
    </main>
  );
}
