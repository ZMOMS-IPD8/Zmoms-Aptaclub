// app/components/ProofImageSection.tsx
"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { extractImageText } from "@/lib/ocr/client-ocr";
import { optimizeProofImage } from "@/lib/images/optimize-proof-image";

const ENABLE_AI_CHECK = false;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_OCR_LENGTH = 10000;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

type ProofImageSectionProps = {
  proofImage: File | null;
  setProofImage: (file: File | null) => void;
  isImageVerified: boolean;
  setIsImageVerified: (value: boolean) => void;
};

type CheckingStage = "OCR" | "AI" | null;

type CheckImageResponse = {
  success?: boolean;
  result?: "PASS" | "REJECT";
  message?: string;
};

type VerificationState = {
  file: File | null;
  checking: boolean;
  stage: CheckingStage;
  error: string;
};

function ImagePreview({ file }: { file: File }) {
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    const image = imageRef.current;
    if (image) image.src = objectUrl;

    return () => {
      if (image) image.removeAttribute("src");
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return (
    <img
      ref={imageRef}
      alt="Hình ảnh minh chứng đã chọn"
      className="max-h-[360px] w-full object-contain"
    />
  );
}

export default function ProofImageSection({
  proofImage,
  setProofImage,
  isImageVerified,
  setIsImageVerified,
}: ProofImageSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const originalFileRef = useRef<File | null>(null);
  const optimizedFileRef = useRef<File | null>(null);
  const processingRef = useRef(false);

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [verification, setVerification] = useState<VerificationState>({
    file: null,
    checking: false,
    stage: null,
    error: "",
  });

  const isCurrentFile = verification.file === proofImage;
  const isCheckingImage = isCurrentFile && verification.checking;
  const isBusy = isCheckingImage || isOptimizing;
  const checkingStage = isCurrentFile ? verification.stage : null;
  const imageError = isCurrentFile ? verification.error : "";

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    };
  }, [proofImage]);

  useEffect(() => {
    if (proofImage !== optimizedFileRef.current) {
      originalFileRef.current = proofImage;
      optimizedFileRef.current = proofImage;
    }
  }, [proofImage]);

  function resetVerification(file: File | null = null) {
    requestIdRef.current += 1;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    processingRef.current = false;
    setVerification({ file, checking: false, stage: null, error: "" });
    setIsImageVerified(false);
  }

  function openCamera() {
    if (isBusy) return;

    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    resetVerification();
    originalFileRef.current = null;
    optimizedFileRef.current = null;
    setProofImage(null);

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setVerification({
        file: null,
        checking: false,
        stage: null,
        error: "Hình ảnh phải có định dạng JPEG, PNG, WebP hoặc GIF.",
      });
      return;
    }

    if (file.size === 0) {
      setVerification({
        file: null,
        checking: false,
        stage: null,
        error: "File hình ảnh rỗng hoặc không hợp lệ.",
      });
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setVerification({
        file: null,
        checking: false,
        stage: null,
        error: "Dung lượng hình ảnh không được vượt quá 10 MB.",
      });
      return;
    }

    const requestId = requestIdRef.current;
    setIsOptimizing(true);

    try {
      const optimizedFile = await optimizeProofImage(file);

      if (requestIdRef.current !== requestId) return;

      const selectedFile =
        optimizedFile.size > 0 &&
        optimizedFile.size <= MAX_IMAGE_SIZE &&
        ALLOWED_IMAGE_TYPES.has(optimizedFile.type)
          ? optimizedFile
          : file;

      originalFileRef.current = file;
      optimizedFileRef.current = selectedFile;

      console.info("[ProofImage] Image optimized", {
        originalType: file.type,
        optimizedType: selectedFile.type,
        originalSize: file.size,
        optimizedSize: selectedFile.size,
        originalSizeMB: Number((file.size / 1048576).toFixed(2)),
        optimizedSizeMB: Number((selectedFile.size / 1048576).toFixed(2)),
        reductionPercent: Number(
          ((1 - selectedFile.size / file.size) * 100).toFixed(1),
        ),
      });

      setVerification({
        file: selectedFile,
        checking: false,
        stage: null,
        error: "",
      });

      setProofImage(selectedFile);
    } catch (error) {
      if (requestIdRef.current !== requestId) return;

      console.warn("[ProofImage] Optimization failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      originalFileRef.current = file;
      optimizedFileRef.current = file;

      setVerification({
        file,
        checking: false,
        stage: null,
        error: "",
      });

      setProofImage(file);
    } finally {
      if (requestIdRef.current === requestId) {
        setIsOptimizing(false);
      }
    }
  }

  async function handleCheckImage() {
    const file = proofImage;

    if (!file || isBusy || processingRef.current) return;

    processingRef.current = true;

    const requestId = ++requestIdRef.current;
    const controller = new AbortController();

    abortControllerRef.current?.abort();
    abortControllerRef.current = controller;

    const isCurrentRequest = () =>
      requestIdRef.current === requestId && !controller.signal.aborted;

    const verificationStartedAt = performance.now();

    const ocrFile =
      optimizedFileRef.current === file && originalFileRef.current
        ? originalFileRef.current
        : file;

    console.info("[ImageCheck Client] Verification started", {
      requestId,
      originalSize: ocrFile.size,
      uploadSize: file.size,
      fileType: file.type,
      aiEnabled: ENABLE_AI_CHECK,
    });

    setIsImageVerified(false);
    setVerification({
      file,
      checking: true,
      stage: "OCR",
      error: "",
    });

    try {
      let ocrText = "";
      const ocrStartedAt = performance.now();

      console.info("[Client OCR] Started", {
        requestId,
        fileType: ocrFile.type,
        fileSize: ocrFile.size,
      });

      try {
        ocrText = await extractImageText(ocrFile);

        console.info("[Client OCR] Result", {
          requestId,
          status: ocrText.trim() ? "SUCCESS" : "EMPTY",
          textLength: ocrText.length,
          trimmedLength: ocrText.trim().length,
          durationMs: Math.round(performance.now() - ocrStartedAt),
        });
      } catch (error) {
        console.warn("[Client OCR] Failed", {
          requestId,
          error: error instanceof Error ? error.message : "Unknown error",
          durationMs: Math.round(performance.now() - ocrStartedAt),
        });
      }

      if (!isCurrentRequest()) return;

      if (!ENABLE_AI_CHECK) {
        console.info("[ImageCheck Client] AI disabled, API request skipped", {
          requestId,
          ocrLength: ocrText.slice(0, MAX_OCR_LENGTH).length,
          totalDurationMs: Math.round(
            performance.now() - verificationStartedAt,
          ),
        });

        setIsImageVerified(true);
        setVerification({
          file,
          checking: false,
          stage: null,
          error: "",
        });

        return;
      }

      setVerification({
        file,
        checking: true,
        stage: "AI",
        error: "",
      });

      const formData = new FormData();
      formData.append("image", file, file.name);
      formData.append("ocrText", ocrText.slice(0, MAX_OCR_LENGTH));

      console.info("[ImageCheck Client] Sending request", {
        requestId,
        endpoint: "/api/ai/check-image",
        imageType: file.type,
        imageSize: file.size,
        imageSizeMB: Number((file.size / 1048576).toFixed(2)),
        ocrLength: ocrText.slice(0, MAX_OCR_LENGTH).length,
        hasOCR: ocrText.trim().length > 0,
      });

      const apiStartedAt = performance.now();

      const response = await fetch("/api/ai/check-image", {
        method: "POST",
        body: formData,
        signal: controller.signal,
        cache: "no-store",
      });

      console.info("[ImageCheck Client] API response received", {
        requestId,
        status: response.status,
        ok: response.ok,
        durationMs: Math.round(performance.now() - apiStartedAt),
      });

      if (!isCurrentRequest()) return;

      let result: CheckImageResponse;

      try {
        result = (await response.json()) as CheckImageResponse;
      } catch {
        throw new Error("Phản hồi từ hệ thống không hợp lệ. Vui lòng thử lại.");
      }

      if (!isCurrentRequest()) return;

      if (!response.ok || result.success !== true) {
        console.warn("[ImageCheck Client] Verification failed", {
          requestId,
          status: response.status,
          message: result.message ?? "Unknown error",
          totalDurationMs: Math.round(
            performance.now() - verificationStartedAt,
          ),
        });

        setVerification({
          file,
          checking: false,
          stage: null,
          error:
            result.message || "Không thể xác thực hình ảnh. Vui lòng thử lại.",
        });

        return;
      }

      if (result.result === "PASS") {
        console.info("[ImageCheck Client] Verification completed", {
          requestId,
          result: "PASS",
          totalDurationMs: Math.round(
            performance.now() - verificationStartedAt,
          ),
        });

        setIsImageVerified(true);
        setVerification({
          file,
          checking: false,
          stage: null,
          error: "",
        });

        return;
      }

      if (result.result === "REJECT") {
        console.info("[ImageCheck Client] Verification completed", {
          requestId,
          result: "REJECT",
          totalDurationMs: Math.round(
            performance.now() - verificationStartedAt,
          ),
        });

        setVerification({
          file,
          checking: false,
          stage: null,
          error:
            "Hình ảnh chưa đáp ứng điều kiện xác thực. Vui lòng cung cấp hình ảnh hoặc giấy tờ rõ ràng, có thông tin chứng minh thai kỳ từ 28–42 tuần hoặc em bé dưới 3 tháng tuổi.",
        });

        return;
      }

      console.error("[ImageCheck Client] Invalid API result", {
        requestId,
        result: result.result ?? null,
      });

      setVerification({
        file,
        checking: false,
        stage: null,
        error: "Hệ thống trả về kết quả không hợp lệ. Vui lòng thử lại.",
      });
    } catch (error) {
      if (!isCurrentRequest()) return;
      if (error instanceof Error && error.name === "AbortError") return;

      console.error("[ImageCheck Client] Processing error", {
        requestId,
        name: error instanceof Error ? error.name : "UnknownError",
        message: error instanceof Error ? error.message : "Unknown error",
        totalDurationMs: Math.round(performance.now() - verificationStartedAt),
      });

      setVerification({
        file,
        checking: false,
        stage: null,
        error:
          error instanceof Error
            ? error.message
            : "Có lỗi khi xác thực hình ảnh. Vui lòng kiểm tra kết nối và thử lại.",
      });
    } finally {
      if (isCurrentRequest()) {
        processingRef.current = false;
        abortControllerRef.current = null;

        setVerification((current) =>
          current.file === file
            ? { ...current, checking: false, stage: null }
            : current,
        );
      }
    }
  }

  function handleRemoveImage() {
    if (isBusy) return;

    resetVerification();
    originalFileRef.current = null;
    optimizedFileRef.current = null;
    setProofImage(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-[#F1D5E4] bg-[#FFFAFD] p-4 sm:p-5">
      <div>
        <label className="block text-[15px] font-bold text-[#303442]">
          Hình ảnh minh chứng <span className="text-[#EC068D]">*</span>
        </label>

        <p className="mt-1.5 text-[12px] leading-5 text-[#606575]">
          Vui lòng cung cấp hình ảnh giấy tờ hoặc thông tin có thể chứng minh
          bạn đang mang thai từ 28–42 tuần hoặc có em bé dưới 3 tháng tuổi.
        </p>

        <div className="mt-3 rounded-xl border border-[#F1D5E4] bg-white p-3">
          <p className="text-[12px] font-semibold text-[#303442]">
            Một số giấy tờ minh chứng tham khảo:
          </p>

          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[12px] leading-5 text-[#606575]">
            <li>Phiếu siêu âm thai, sổ khám thai hoặc giấy khám thai.</li>
            <li>
              Giấy tờ theo dõi thai kỳ có thông tin tuổi thai hoặc ngày dự sinh.
            </li>
            <li>
              Giấy khai sinh, giấy chứng sinh hoặc giấy ra viện của em bé.
            </li>
            <li>
              Sổ tiêm chủng, phiếu tiêm chủng hoặc giấy tờ có thông tin ngày
              sinh của bé.
            </li>
            <li>Các giấy tờ hoặc thông tin minh chứng phù hợp khác.</li>
          </ul>
        </div>

        <p className="mt-2 text-[11px] leading-5 text-[#858997]">
          Vui lòng đảm bảo hình ảnh rõ nét, đầy đủ thông tin cần thiết để hệ
          thống xác thực.
        </p>

        <p className="mt-2 text-[11px] font-medium leading-5 text-[#777777]">
          Hình ảnh chỉ phục vụ mục đích xác thực điều kiện đăng ký hội viên.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        capture="environment"
        hidden
        onChange={handleImageChange}
        disabled={isBusy}
      />

      {isOptimizing && (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 rounded-xl border border-[#F1D5E4] bg-white p-4 text-center text-[12px] font-medium text-[#C40B75]"
        >
          Hệ thống đang tối ưu hình ảnh, vui lòng chờ...
        </div>
      )}

      {!isOptimizing &&
        (proofImage ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-[#E8E8ED] bg-white p-3">
            <div className="flex items-center justify-between gap-2 pb-3">
              <span className="text-[12px] font-semibold text-[#27845D]">
                {isImageVerified
                  ? ENABLE_AI_CHECK
                    ? "Hình ảnh đã được xác thực"
                    : "Hình ảnh đã được xác thực"
                  : "Hình ảnh đã sẵn sàng"}
              </span>

              <span className="text-[11px] text-[#858997]">
                {(proofImage.size / 1048576).toFixed(2)} MB
              </span>
            </div>

            <div className="flex min-h-40 items-center justify-center overflow-hidden rounded-lg bg-[#F7F7F9]">
              <ImagePreview file={proofImage} />
            </div>

            <p className="mt-3 break-all text-[12px] text-[#777777]">
              {proofImage.name}
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isBusy}
                onClick={openCamera}
                className="min-h-11 rounded-xl border border-[#EC068D] bg-white px-3 py-2.5 text-[13px] font-bold text-[#EC068D] disabled:opacity-50"
              >
                Chụp lại
              </button>

              <button
                type="button"
                disabled={isBusy}
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
            disabled={isBusy}
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
        ))}

      {proofImage && !isOptimizing && !isImageVerified && (
        <button
          type="button"
          onClick={handleCheckImage}
          disabled={isBusy}
          className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#EC068D] px-4 py-3 text-[14px] font-bold text-white transition hover:bg-[#D9057F] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCheckingImage && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}

          {isCheckingImage
            ? checkingStage === "OCR"
              ? "ĐANG ĐỌC THÔNG TIN..."
              : "ĐANG XÁC THỰC HÌNH ẢNH..."
            : ENABLE_AI_CHECK
              ? "KIỂM TRA HÌNH ẢNH MINH CHỨNG"
              : "KIỂM TRA HÌNH ẢNH MINH CHỨNG"}
        </button>
      )}

      {isCheckingImage && (
        <p
          role="status"
          aria-live="polite"
          className="mt-3 text-center text-[12px] text-[#C40B75]"
        >
          {checkingStage === "OCR"
            ? "Hệ thống đang nhận diện thông tin minh chứng."
            : "Hệ thống đang kiểm tra điều kiện đăng ký hội viên."}
        </p>
      )}

      {proofImage && !isOptimizing && isImageVerified && (
        <div
          role="status"
          aria-live="polite"
          className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[13px] font-semibold text-emerald-700"
        >
          ✓{" "}
          {ENABLE_AI_CHECK
            ? "Hình ảnh minh chứng hợp lệ. Bạn có thể tiếp tục đăng ký hội viên."
            : "Hình ảnh minh chứng hợp lệ. Bạn có thể tiếp tục đăng ký hội viên."}
        </div>
      )}

      {imageError && !isOptimizing && (
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
