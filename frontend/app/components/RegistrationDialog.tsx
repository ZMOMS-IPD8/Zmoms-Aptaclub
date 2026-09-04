"use client";

type RegistrationDialogProps = {
  open: boolean;
  title: string;
  message: string;
  status: "success" | "warning" | "error";
  zaloUrl?: string;
  onClose: () => void;
};

export default function RegistrationDialog({
  open,
  title,
  message,
  status,
  zaloUrl,
  onClose,
}: RegistrationDialogProps) {
  if (!open) {
    return null;
  }

  const isZaloAction =
    Boolean(zaloUrl) && (status === "warning" || status === "error");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex justify-center">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full ${
              status === "success"
                ? "bg-green-100 text-green-600"
                : status === "warning"
                  ? "bg-amber-100 text-amber-600"
                  : "bg-red-100 text-red-600"
            }`}
          >
            {status === "success" && (
              <svg
                className="h-7 w-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M5 12l4 4L19 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}

            {status === "warning" && (
              <svg
                className="h-7 w-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 8v4" strokeLinecap="round" />
                <path d="M12 16h.01" strokeLinecap="round" />
                <path
                  d="M10.3 3.6L2.9 17a2 2 0 001.7 3h14.8a2 2 0 001.7-3L13.7 3.6a2 2 0 00-3.4 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}

            {status === "error" && (
              <svg
                className="h-7 w-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            )}
          </div>
        </div>

        <h3 className="mt-4 text-center text-lg font-semibold text-gray-900">
          {title}
        </h3>

        <p className="mt-2 text-center text-sm leading-6 text-gray-600">
          {message}
        </p>

        <div className="mt-6 flex flex-col gap-2">
          {isZaloAction && (
            <a
              href={zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 items-center justify-center rounded-xl bg-[#0068FF] px-4 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Đến Zalo OA
            </a>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 items-center justify-center rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
