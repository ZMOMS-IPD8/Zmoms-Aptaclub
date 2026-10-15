"use client";

import { useMemo, useRef, useState } from "react";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

type ProofImageSectionProps = {
  proofImage: File | null;
  setProofImage: (file: File | null) => void;
  isImageVerified: boolean;
  setIsImageVerified: (value: boolean) => void;
};

export default function ProofImageSection({
  proofImage,
  setProofImage,
  isImageVerified,
  setIsImageVerified,
}: ProofImageSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isCheckingImage, setIsCheckingImage] = useState(false);
  const [imageError, setImageError] = useState("");

  const previewUrl = useMemo(
    () => (proofImage ? URL.createObjectURL(proofImage) : ""),
    [proofImage],
  );

  function openCamera() {
    if (isCheckingImage) return;

    setImageError("");
    setIsImageVerified(false);

    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setIsImageVerified(false);
    setImageError("");

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setProofImage(null);
      setImageError("Ảnh phải có định dạng JPEG, PNG, WebP hoặc GIF.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setProofImage(null);
      setImageError("Dung lượng ảnh không được vượt quá 10 MB.");
      event.target.value = "";
      return;
    }

    setProofImage(file);
  }

  async function handleCheckImage() {
    if (!proofImage || isCheckingImage) return;

    setImageError("");
    setIsImageVerified(false);
    setIsCheckingImage(true);

    try {
      const formData = new FormData();
      formData.append("image", proofImage);

      const response = await fetch("/api/ai/check-image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || result.success !== true) {
        setImageError(
          result.message || "Không thể kiểm tra ảnh. Vui lòng thử lại.",
        );
        return;
      }

      if (result.result === "PASS") {
        setIsImageVerified(true);
        return;
      }

      setImageError(
        "Hình không hợp lệ. Vui lòng chụp lại ảnh rõ ràng và đúng yêu cầu.",
      );
    } catch {
      setImageError(
        "Có lỗi khi kiểm tra ảnh. Vui lòng kiểm tra kết nối và thử lại.",
      );
    } finally {
      setIsCheckingImage(false);
    }
  }

  function handleRemoveImage() {
    setProofImage(null);
    setIsImageVerified(false);
    setImageError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-[#F1D5E4] bg-[#FFFAFD] p-4 sm:p-5">
      <div>
        <label className="block text-[15px] font-bold text-[#303442]">
          Hình chụp minh chứng <span className="text-[#EC068D]">*</span>
        </label>

        <p className="mt-1.5 text-[12px] leading-5 text-[#777777]">
          Chụp trực tiếp hình minh chứng. Hệ thống sẽ kiểm tra ảnh trước khi cho
          phép đăng ký.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={handleImageChange}
      />

      {previewUrl && proofImage ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-[#E8E8ED] bg-white p-3">
          <div className="flex items-center justify-between gap-2 pb-3">
            <span className="text-[12px] font-semibold text-[#27845D]">
              Ảnh đã sẵn sàng
            </span>

            <span className="text-[11px] text-[#858997]">Tối đa 10 MB</span>
          </div>

          <div className="flex min-h-40 items-center justify-center overflow-hidden rounded-lg bg-[#F7F7F9]">
            <img
              src={previewUrl}
              alt="Ảnh minh chứng"
              className="max-h-[360px] w-full object-contain"
            />
          </div>

          <p className="mt-3 break-all text-[12px] text-[#777777]">
            {proofImage.name}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isCheckingImage}
              onClick={openCamera}
              className="min-h-11 rounded-xl border border-[#EC068D] bg-white px-3 py-2.5 text-[13px] font-bold text-[#EC068D] disabled:opacity-50"
            >
              Chụp lại
            </button>

            <button
              type="button"
              disabled={isCheckingImage}
              onClick={handleRemoveImage}
              className="min-h-11 rounded-xl border border-[#E1E4EA] bg-white px-3 py-2.5 text-[13px] font-semibold text-[#606575] disabled:opacity-50"
            >
              Xóa ảnh
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openCamera}
          disabled={isCheckingImage}
          className="mt-4 flex min-h-36 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#ED9CC8] bg-white px-4 py-6 text-center transition hover:border-[#EC068D] hover:bg-[#FFF7FB] disabled:opacity-50"
        >
          <span className="text-[14px] font-bold text-[#EC068D]">
            Chụp hình minh chứng
          </span>

          <span className="mt-1.5 text-[12px] text-[#858997]">
            JPEG, PNG, WebP hoặc GIF
          </span>

          <span className="mt-1 text-[11px] text-[#A0A4AE]">
            Dung lượng tối đa 10 MB
          </span>
        </button>
      )}

      {proofImage && !isImageVerified && (
        <button
          type="button"
          onClick={handleCheckImage}
          disabled={isCheckingImage}
          className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#EC068D] px-4 py-3 text-[14px] font-bold text-white transition hover:bg-[#D9057F] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCheckingImage && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}

          {isCheckingImage ? "ĐANG KIỂM TRA ẢNH..." : "KIỂM TRA ẢNH MINH CHỨNG"}
        </button>
      )}

      {isCheckingImage && (
        <p
          role="status"
          className="mt-3 text-center text-[12px] text-[#C40B75]"
        >
          Vui lòng chờ hệ thống kiểm tra ảnh.
        </p>
      )}

      {isImageVerified && (
        <div
          role="status"
          aria-live="polite"
          className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[13px] font-semibold text-emerald-700"
        >
          ✓ Hình hợp lệ. Bạn có thể đăng ký hội viên.
        </div>
      )}

      {imageError && (
        <div
          role="alert"
          className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3 text-[13px] leading-5 text-red-600"
        >
          {imageError}
        </div>
      )}
    </section>
  );
}
