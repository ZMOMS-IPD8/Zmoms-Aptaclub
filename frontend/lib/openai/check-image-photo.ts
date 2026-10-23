// lib/openai/check-image-photo.ts
export type PhotoEvidenceType = "PREGNANCY_PHOTO" | "BABY_PHOTO";

export type PhotoEvidence = {
  type: string;
  documentRecognized: boolean;
  conflictingInformation: boolean;
  readable: boolean;
  visualEvidenceStrong: boolean;
  genuinePhoto: boolean;
};

export type PhotoEvaluation = {
  result: "PASS" | "REJECT";
  reason: string;
  method: "VISUAL_ESTIMATE" | "NONE";
};

export function isPhotoEvidenceType(type: string): type is PhotoEvidenceType {
  return type === "PREGNANCY_PHOTO" || type === "BABY_PHOTO";
}

function reject(reason: string): PhotoEvaluation {
  return {
    result: "REJECT",
    reason,
    method: "NONE",
  };
}

export function evaluatePhoto(evidence: PhotoEvidence): PhotoEvaluation {
  if (!isPhotoEvidenceType(evidence.type)) {
    return reject("unsupported_photo_type");
  }

  if (evidence.documentRecognized) {
    return reject("photo_classified_as_document");
  }

  if (evidence.conflictingInformation) {
    return reject("conflicting_photo_information");
  }

  if (!evidence.readable) {
    return reject("photo_not_readable");
  }

  if (!evidence.genuinePhoto) {
    return reject("not_recognized_as_real_photo");
  }

  if (!evidence.visualEvidenceStrong) {
    return reject("insufficient_visual_evidence");
  }

  if (evidence.type === "PREGNANCY_PHOTO") {
    return {
      result: "PASS",
      reason: "visual_pregnancy_photo_accepted_not_age_verified",
      method: "VISUAL_ESTIMATE",
    };
  }

  return {
    result: "PASS",
    reason: "visual_small_baby_photo_accepted_not_age_verified",
    method: "VISUAL_ESTIMATE",
  };
}
