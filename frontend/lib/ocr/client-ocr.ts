// lib/ocr/client-ocr.ts
import { createWorker, type Worker } from "tesseract.js";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

let workerPromise: Promise<Worker> | null = null;
let recognitionQueue: Promise<void> = Promise.resolve();

function assertBrowser(): void {
  if (typeof window === "undefined") {
    throw new Error("Tesseract OCR chỉ được chạy trên trình duyệt.");
  }
}

function validateImage(file: File): void {
  if (!(file instanceof File)) throw new Error("File ảnh không hợp lệ.");
  if (file.size === 0) throw new Error("File ảnh rỗng.");
  if (file.size > MAX_IMAGE_SIZE)
    throw new Error("Dung lượng ảnh không được vượt quá 10 MB.");
  if (!ALLOWED_IMAGE_TYPES.has(file.type))
    throw new Error("Định dạng ảnh không được hỗ trợ.");
}

async function getWorker(): Promise<Worker> {
  assertBrowser();

  if (!workerPromise) {
    workerPromise = createWorker("vie+eng").catch((error: unknown) => {
      workerPromise = null;
      throw error;
    });
  }

  return workerPromise;
}

async function runSequentially<T>(task: () => Promise<T>): Promise<T> {
  const previousTask = recognitionQueue;
  let releaseQueue!: () => void;

  recognitionQueue = new Promise<void>((resolve) => {
    releaseQueue = resolve;
  });

  await previousTask;

  try {
    return await task();
  } finally {
    releaseQueue();
  }
}

export async function extractImageText(file: File): Promise<string> {
  assertBrowser();
  validateImage(file);

  return runSequentially(async () => {
    const worker = await getWorker();

    try {
      const result = await worker.recognize(file);
      return (result.data.text ?? "")
        .replace(/\r\n/g, "\n")
        .replace(/\u0000/g, "")
        .trim();
    } catch (error) {
      const failedWorker = workerPromise;
      workerPromise = null;

      if (failedWorker) {
        try {
          const instance = await failedWorker;
          await instance.terminate();
        } catch {
          console.warn("[Client OCR] Không thể giải phóng Worker.");
        }
      }

      throw error;
    }
  });
}

export async function terminateImageOCR(): Promise<void> {
  assertBrowser();

  return runSequentially(async () => {
    const currentWorker = workerPromise;
    workerPromise = null;

    if (!currentWorker) return;

    try {
      const worker = await currentWorker;
      await worker.terminate();
    } catch {
      console.warn("[Client OCR] Không thể giải phóng Worker.");
    }
  });
}
