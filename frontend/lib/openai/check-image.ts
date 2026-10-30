// lib/openai/check-image.ts
import { extractWithSelectedModel } from "./check-image-model";
import { evaluatePhoto, isPhotoEvidenceType } from "./check-image-photo";

export type ImageCheckResult = "PASS" | "REJECT";

type EvidenceType =
  | "PREGNANCY"
  | "BABY"
  | "PREGNANCY_PHOTO"
  | "BABY_PHOTO"
  | "PHOTO_ONLY"
  | "OTHER";

export type ExtractedEvidence = {
  type: EvidenceType;
  documentRecognized: boolean;
  examDate: string | null;
  gestationalWeeks: number | null;
  gestationalDays: number | null;
  estimatedDueDate: string | null;
  lastMenstrualPeriod: string | null;
  dateOfBirth: string | null;
  conflictingInformation: boolean;
  readable: boolean;
  visualEvidenceStrong: boolean;
  genuinePhoto: boolean;
};

type VerificationMethod = "DOCUMENT" | "VISUAL_ESTIMATE" | "NONE";

export type Evaluation = {
  result: ImageCheckResult;
  reason: string;
  method: VerificationMethod;
  gestationalAgeDays?: number;
  babyAgeDays?: number;
};

type GestationalCandidate = {
  source: "EXAM" | "EDD" | "LMP";
  ageDays: number;
};

const ENABLE_AI_CHECK = false;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_OCR_LENGTH = 10000;

const MIN_GESTATIONAL_DAYS = 28 * 7;
const MAX_GESTATIONAL_DAYS = 42 * 7;
const MAX_GESTATIONAL_DISAGREEMENT_DAYS = 14;
const MAX_PLAUSIBLE_GESTATIONAL_DAYS = 43 * 7 + 6;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const EVIDENCE_TYPES: EvidenceType[] = [
  "PREGNANCY",
  "BABY",
  "PREGNANCY_PHOTO",
  "BABY_PHOTO",
  "PHOTO_ONLY",
  "OTHER",
];

const REQUIRED_KEYS = [
  "type",
  "documentRecognized",
  "examDate",
  "gestationalWeeks",
  "gestationalDays",
  "estimatedDueDate",
  "lastMenstrualPeriod",
  "dateOfBirth",
  "conflictingInformation",
  "readable",
  "visualEvidenceStrong",
  "genuinePhoto",
] as const;

const BOOLEAN_KEYS = [
  "documentRecognized",
  "conflictingInformation",
  "readable",
  "visualEvidenceStrong",
  "genuinePhoto",
] as const;

const DATE_KEYS = [
  "examDate",
  "estimatedDueDate",
  "lastMenstrualPeriod",
  "dateOfBirth",
] as const;

function getVietnamDate(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Không xác định được ngày kiểm tra tại Việt Nam");
  }

  return `${year}-${month}-${day}`;
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (
    year < 1900 ||
    year > 2200 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

function addCalendarMonths(date: Date, months: number): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  const target = new Date(Date.UTC(year, month + months, 1));

  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();

  target.setUTCDate(Math.min(day, lastDay));

  return target;
}

function optionalDate(value: unknown): string | null {
  return typeof value === "string" && parseDate(value) ? value : null;
}

function optionalInteger(
  value: unknown,
  min: number,
  max: number,
): number | null {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= min &&
    value <= max
    ? value
    : null;
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

export function parseEvidence(content: string): ExtractedEvidence {
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  const parsed: unknown = JSON.parse(cleaned);

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("AI trả về cấu trúc JSON không hợp lệ");
  }

  const value = parsed as Record<string, unknown>;

  for (const key of REQUIRED_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) {
      throw new Error(`AI thiếu trường bắt buộc: ${key}`);
    }
  }

  if (
    typeof value.type !== "string" ||
    !EVIDENCE_TYPES.includes(value.type as EvidenceType)
  ) {
    throw new Error("AI trả về loại bằng chứng không hợp lệ");
  }

  for (const key of BOOLEAN_KEYS) {
    if (!isBoolean(value[key])) {
      throw new Error(`AI trả về kiểu dữ liệu sai: ${key}`);
    }
  }

  for (const key of DATE_KEYS) {
    if (
      value[key] !== null &&
      (typeof value[key] !== "string" || !parseDate(value[key]))
    ) {
      throw new Error(`AI trả về ngày không hợp lệ: ${key}`);
    }
  }

  const weeks = optionalInteger(value.gestationalWeeks, 0, 43);
  const days = optionalInteger(value.gestationalDays, 0, 6);

  if (value.gestationalWeeks !== null && weeks === null) {
    throw new Error("AI trả về số tuần thai không hợp lệ");
  }

  if (value.gestationalDays !== null && days === null) {
    throw new Error("AI trả về số ngày thai không hợp lệ");
  }

  return {
    type: value.type as EvidenceType,
    documentRecognized: value.documentRecognized as boolean,
    examDate: optionalDate(value.examDate),
    gestationalWeeks: weeks,
    gestationalDays: days,
    estimatedDueDate: optionalDate(value.estimatedDueDate),
    lastMenstrualPeriod: optionalDate(value.lastMenstrualPeriod),
    dateOfBirth: optionalDate(value.dateOfBirth),
    conflictingInformation: value.conflictingInformation as boolean,
    readable: value.readable as boolean,
    visualEvidenceStrong: value.visualEvidenceStrong as boolean,
    genuinePhoto: value.genuinePhoto as boolean,
  };
}

function reject(reason: string): Evaluation {
  return {
    result: "REJECT",
    reason,
    method: "NONE",
  };
}

function evaluateBabyDocument(
  evidence: ExtractedEvidence,
  today: Date,
): Evaluation {
  const birth = parseDate(evidence.dateOfBirth);

  if (!birth) {
    return reject("missing_birth_date");
  }

  const ageDays = daysBetween(birth, today);

  if (ageDays < 0) {
    return reject("birth_date_in_future");
  }

  const threeMonthDate = addCalendarMonths(birth, 3);
  const valid = today.getTime() < threeMonthDate.getTime();

  return {
    result: valid ? "PASS" : "REJECT",
    reason: valid ? "baby_under_3_months" : "baby_outside_age_range",
    method: valid ? "DOCUMENT" : "NONE",
    babyAgeDays: ageDays,
  };
}

function buildGestationalCandidates(
  evidence: ExtractedEvidence,
  today: Date,
): GestationalCandidate[] {
  const candidates: GestationalCandidate[] = [];
  const examDate = parseDate(evidence.examDate);
  const weeks = evidence.gestationalWeeks;
  const days = evidence.gestationalDays;

  if (examDate && weeks !== null && days !== null) {
    const elapsedDays = daysBetween(examDate, today);
    const ageAtExam = weeks * 7 + days;

    if (
      elapsedDays >= 0 &&
      ageAtExam >= 0 &&
      ageAtExam <= MAX_PLAUSIBLE_GESTATIONAL_DAYS
    ) {
      candidates.push({
        source: "EXAM",
        ageDays: ageAtExam + elapsedDays,
      });
    }
  }

  const dueDate = parseDate(evidence.estimatedDueDate);

  if (dueDate) {
    const daysUntilDue = daysBetween(today, dueDate);
    const ageFromEDD = 280 - daysUntilDue;

    candidates.push({
      source: "EDD",
      ageDays: ageFromEDD,
    });
  }

  const lmp = parseDate(evidence.lastMenstrualPeriod);

  if (lmp) {
    const ageFromLMP = daysBetween(lmp, today);

    if (ageFromLMP >= 0) {
      candidates.push({
        source: "LMP",
        ageDays: ageFromLMP,
      });
    }
  }

  return candidates;
}

function evaluatePregnancyDocument(
  evidence: ExtractedEvidence,
  today: Date,
): Evaluation {
  const candidates = buildGestationalCandidates(evidence, today);

  if (candidates.length === 0) {
    return reject("missing_usable_gestational_dates");
  }

  const ages = candidates.map((candidate) => candidate.ageDays);
  const minimumAge = Math.min(...ages);
  const maximumAge = Math.max(...ages);

  if (maximumAge - minimumAge > MAX_GESTATIONAL_DISAGREEMENT_DAYS) {
    return reject("gestational_dates_disagree");
  }

  const allSourcesInRange = ages.every(
    (age) => age >= MIN_GESTATIONAL_DAYS && age <= MAX_GESTATIONAL_DAYS,
  );

  const representativeAge = Math.round(
    ages.reduce((sum, age) => sum + age, 0) / ages.length,
  );

  return {
    result: allSourcesInRange ? "PASS" : "REJECT",
    reason: allSourcesInRange
      ? "pregnancy_28_to_42_weeks"
      : "pregnancy_outside_28_to_42_weeks",
    method: allSourcesInRange ? "DOCUMENT" : "NONE",
    gestationalAgeDays: representativeAge,
  };
}

function hasUnexpectedPhotoData(evidence: ExtractedEvidence): boolean {
  return (
    evidence.examDate !== null ||
    evidence.gestationalWeeks !== null ||
    evidence.gestationalDays !== null ||
    evidence.estimatedDueDate !== null ||
    evidence.lastMenstrualPeriod !== null ||
    evidence.dateOfBirth !== null
  );
}

export function evaluateEvidence(
  evidence: ExtractedEvidence,
  today: Date,
): Evaluation {
  if (evidence.conflictingInformation) {
    return reject("conflicting_information");
  }

  if (!evidence.readable) {
    return reject("unreadable_image");
  }

  if (isPhotoEvidenceType(evidence.type)) {
    if (hasUnexpectedPhotoData(evidence)) {
      return reject("unexpected_photo_document_data");
    }

    return evaluatePhoto(evidence);
  }

  if (evidence.type === "PHOTO_ONLY" || evidence.type === "OTHER") {
    return reject("unsupported_evidence");
  }

  if (!evidence.documentRecognized) {
    return reject("document_not_recognized");
  }

  if (evidence.type === "BABY") {
    return evaluateBabyDocument(evidence, today);
  }

  if (evidence.type === "PREGNANCY") {
    return evaluatePregnancyDocument(evidence, today);
  }

  return reject("unsupported_evidence");
}

export async function checkImage(
  file: File,
  ocrText = "",
): Promise<ImageCheckResult> {
  if (!file || file.size === 0)
    throw new Error("File ảnh rỗng hoặc không hợp lệ");

  if (!ALLOWED_TYPES.has(file.type))
    throw new Error(`Định dạng ảnh không được hỗ trợ: ${file.type}`);

  if (file.size > MAX_FILE_SIZE) throw new Error("Ảnh vượt quá giới hạn 10 MB");

  if (!ENABLE_AI_CHECK) {
    console.info("[ImageCheck] AI disabled", {
      result: "PASS",
      verifiedByAI: false,
      fileSize: file.size,
      fileType: file.type,
    });
    return "PASS";
  }

  const startedAt = Date.now();
  const today = parseDate(getVietnamDate());

  if (!today) throw new Error("Ngày kiểm tra không hợp lệ");

  const normalizedOCR =
    typeof ocrText === "string" ? ocrText.slice(0, MAX_OCR_LENGTH) : "";

  const result = await extractWithSelectedModel(
    file,
    normalizedOCR,
    today,
    evaluateEvidence,
    parseEvidence,
  );

  const {
    evidence,
    decision,
    selectedModel,
    finalModel,
    selectionReason,
    fallbackTriggered,
    totalEstimatedCostUsd,
    costComplete,
  } = result;

  console.info("[ImageCheck] Classification", {
    selectedModel,
    selectionReason,
    finalModel,
    fallbackTriggered,
    type: evidence.type,
    documentRecognized: evidence.documentRecognized,
    readable: evidence.readable,
    conflictingInformation: evidence.conflictingInformation,
    visualEvidenceStrong: evidence.visualEvidenceStrong,
    genuinePhoto: evidence.genuinePhoto,
    verificationMethod: decision.method,
    hasExamDate: evidence.examDate !== null,
    hasGestationalAge: evidence.gestationalWeeks !== null,
    hasDueDate: evidence.estimatedDueDate !== null,
    hasLastMenstrualPeriod: evidence.lastMenstrualPeriod !== null,
    hasBirthDate: evidence.dateOfBirth !== null,
    gestationalAgeDays: decision.gestationalAgeDays ?? null,
    babyAgeDays: decision.babyAgeDays ?? null,
    result: decision.result,
    reason: decision.reason,
    durationMs: Date.now() - startedAt,
    totalEstimatedCostUsd: costComplete ? totalEstimatedCostUsd : null,
  });

  return decision.result;
}
