"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/dashboard/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || "Tài khoản hoặc mật khẩu không đúng.");
        setLoading(false);
        return;
      }

      if (!data?.success) {
        setError(data?.message || "Đăng nhập thất bại.");
        setLoading(false);
        return;
      }

      router.replace("/dashboard");
    } catch {
      setError("Không thể kết nối đến hệ thống.");
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#F2F6FF] px-4">
      {loading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex w-[320px] flex-col items-center rounded-2xl bg-white px-6 py-7 text-center shadow-xl">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#173B8F]" />

            <p className="mt-5 text-base font-semibold text-[#173B8F]">
              Đang đăng nhập...
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Đang kiểm tra thông tin và chuyển đến Dashboard
            </p>
          </div>
        </div>
      ) : null}

      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-[#173B8F]">
              ZMOMS Dashboard
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Đăng nhập hệ thống quản trị
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Tài khoản
              </label>

              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                autoFocus
                required
                disabled={loading}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#173B8F] focus:ring-2 focus:ring-[#173B8F]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
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
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#173B8F] focus:ring-2 focus:ring-[#173B8F]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
              />
            </div>

            {error ? (
              <div
                role="alert"
                className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#173B8F] px-4 py-3 font-semibold text-white transition hover:bg-[#123174] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
