// hooks/useRegistrationForm.ts
"use client";

import { useState } from "react";
import type { RegistrationData } from "../types/registration";
import {
  isValidRegistrationReferralCode,
  getRegistrationReferralMapping,
} from "@/lib/referral-codes";

export type RegistrationDialogState = {
  open: boolean;
  title: string;
  message: string;
  status: "success" | "warning" | "error";
  zaloUrl?: string;
};

function getEventCodes(referralCode: string): string[] {
  const normalizedCode = referralCode.trim().toUpperCase();

  if (!normalizedCode) {
    return [];
  }

  return getRegistrationReferralMapping(normalizedCode);
}

export function useRegistrationForm() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("");
  const [babyDate, setBabyDate] = useState("");
  const [referralCode, setReferralCodeState] = useState("");
  const [eventCode, setEventCode] = useState("");

  const [consentMember, setConsentMember] = useState(false);
  const [consentAptaclub, setConsentAptaclub] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [consentDanone, setConsentDanone] = useState(false);
  const [consentAptaclubZalo, setConsentAptaclubZalo] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dialog, setDialog] = useState<RegistrationDialogState>({
    open: false,
    title: "",
    message: "",
    status: "success",
  });

  const setReferralCode = (value: string) => {
    const normalizedCode = value.toUpperCase();

    setReferralCodeState(normalizedCode);

    const events = getEventCodes(normalizedCode);

    if (!events.includes(eventCode)) {
      setEventCode("");
    }
  };

  const availableEventCodes = getEventCodes(referralCode);

  const getFormData = (): RegistrationData => {
    return {
      fullName: fullName.trim(),
      phone: phone.trim(),
      province,
      babyDate,
      referralCode: referralCode.trim().toUpperCase(),
      eventCode: eventCode.trim().toUpperCase(),
      consentMember,
      consentAptaclub,
      consentMarketing,
      consentDanone,
      consentAptaclubZalo,
      eligibleForDanoneCRM: consentAptaclub && consentDanone,
    };
  };

  const parseDate = (value: string): Date | null => {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (!match) {
      return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    date.setHours(0, 0, 0, 0);

    return date;
  };

  const isEligibleBabyDate = (value: string): boolean => {
    const selectedDate = parseDate(value);

    if (!selectedDate) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      const latestDueDate = new Date(today);

      latestDueDate.setDate(latestDueDate.getDate() + 84);
      latestDueDate.setHours(0, 0, 0, 0);

      return selectedDate <= latestDueDate;
    }

    const threeMonthsLater = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 3,
      selectedDate.getDate(),
    );

    threeMonthsLater.setHours(0, 0, 0, 0);

    return threeMonthsLater > today;
  };

  const validate = (): string | null => {
    if (!fullName.trim()) {
      return "Vui lòng nhập họ và tên.";
    }

    const cleanPhone = phone.trim();

    if (!cleanPhone) {
      return "Vui lòng nhập số điện thoại.";
    }

    if (!/^0(3|5|7|8|9)[0-9]{8}$/.test(cleanPhone)) {
      return "Vui lòng nhập số điện thoại hợp lệ.";
    }

    const cleanReferralCode = referralCode.trim().toUpperCase();
    const cleanEventCode = eventCode.trim().toUpperCase();

    if (
      cleanReferralCode &&
      !isValidRegistrationReferralCode(cleanReferralCode)
    ) {
      return "Mã giới thiệu không hợp lệ.";
    }

    if (!cleanReferralCode && cleanEventCode) {
      return "Vui lòng chọn mã giới thiệu trước khi chọn mã sự kiện.";
    }

    if (cleanReferralCode) {
      const events = getEventCodes(cleanReferralCode);

      if (events.length > 0 && !cleanEventCode) {
        return "Vui lòng chọn mã sự kiện.";
      }

      if (cleanEventCode && !events.includes(cleanEventCode)) {
        return "Mã sự kiện không phù hợp với mã giới thiệu.";
      }
    }

    if (!province) {
      return "Vui lòng chọn tỉnh / thành.";
    }

    if (!babyDate) {
      return "Vui lòng chọn ngày dự sinh hoặc ngày sinh của bé.";
    }

    const selectedDate = parseDate(babyDate);

    if (!selectedDate) {
      return "Ngày dự sinh hoặc ngày sinh của bé không hợp lệ.";
    }

    if (!isEligibleBabyDate(babyDate)) {
      return "Thông tin ngày dự sinh hoặc ngày sinh của bé chưa phù hợp để đăng ký.";
    }

    if (!consentMember) {
      return "Vui lòng đồng ý đăng ký hội viên để tiếp tục.";
    }

    return null;
  };

  const showError = (title: string, message: string, zaloUrl?: string) => {
    setDialog({
      open: true,
      title,
      message,
      status: "error",
      zaloUrl,
    });
  };

  const showWarning = (title: string, message: string, zaloUrl?: string) => {
    setDialog({
      open: true,
      title,
      message,
      status: "warning",
      zaloUrl,
    });
  };

  const handleSubmit = async (e: React.FormEvent, proofImage: File) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!(proofImage instanceof File) || proofImage.size === 0) {
      showWarning(
        "Thiếu hình minh chứng",
        "Vui lòng chụp và kiểm tra ảnh minh chứng trước khi đăng ký.",
      );
      return;
    }

    const validationError = validate();

    if (validationError) {
      showWarning("Thông tin chưa phù hợp", validationError);
      return;
    }

    const data = getFormData();

    try {
      setIsSubmitting(true);

      const registrationPayload = {
        fullName: data.fullName,
        phone: data.phone,
        province: data.province,
        babyDate: data.babyDate,
        referralCode: data.referralCode,
        eventCode: data.eventCode,
        consentMember: data.consentMember,
        consentAptaclub: data.consentAptaclub,
        consentMarketing: data.consentMarketing,
        consentDanone: data.consentDanone,
      };

      const checkResponse = await fetch("/api/pancake/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationPayload),
      });

      const checkResult = await checkResponse.json();

      if (checkResult?.status === "NOT_IN_ZALO") {
        showWarning(
          "Chưa tham gia Zalo OA",
          checkResult.message ||
            "Hiện tại bạn chưa tham gia Zalo OA của ZMoms. Vui lòng vào Zalo OA và để lại số điện thoại Zalo của mình để tiếp tục.",
          checkResult.zaloUrl,
        );
        return;
      }

      if (checkResult?.status === "ALREADY_REGISTERED") {
        showWarning(
          "Thông tin đã được đăng ký",
          checkResult.message ||
            "Thông tin của bạn đã được đăng ký rồi. Vui lòng liên hệ ZMoms để được hỗ trợ.",
          checkResult.zaloUrl,
        );
        return;
      }

      if (checkResult?.status === "CONSENT_REQUIRED") {
        showWarning(
          "Chưa đủ điều kiện đăng ký",
          checkResult.message ||
            "Vui lòng đồng ý đăng ký hội viên để tiếp tục.",
        );
        return;
      }

      if (checkResult?.status === "INVALID_REFERRAL_CODE") {
        showWarning(
          "Mã giới thiệu không hợp lệ",
          checkResult.message || "Vui lòng kiểm tra lại mã giới thiệu của bạn.",
        );
        return;
      }

      if (checkResult?.status === "INVALID_EVENT_CODE") {
        showWarning(
          "Mã sự kiện không hợp lệ",
          checkResult.message || "Mã sự kiện không phù hợp với mã giới thiệu.",
        );
        return;
      }

      if (checkResult?.status === "INVALID_DATE") {
        showWarning(
          "Thông tin chưa phù hợp",
          checkResult.message ||
            "Thông tin ngày dự sinh hoặc ngày sinh của bé chưa phù hợp.",
        );
        return;
      }

      if (!checkResponse.ok || checkResult?.status !== "ELIGIBLE") {
        showError(
          "Kiểm tra đăng ký thất bại",
          checkResult?.message ||
            "Không thể kiểm tra điều kiện đăng ký. Vui lòng thử lại.",
          checkResult?.zaloUrl,
        );
        return;
      }

      const uploadFormData = new FormData();

      uploadFormData.append("phone", data.phone);
      uploadFormData.append("hinh_minh_chung", proofImage, proofImage.name);

      const uploadResponse = await fetch("/api/pancake/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok || uploadResult?.success !== true) {
        showError(
          "Tải ảnh minh chứng thất bại",
          uploadResult?.message ||
            "Không thể tải ảnh minh chứng lên. Vui lòng thử lại.",
        );
        return;
      }

      let proofImageUrl = "";

      if (uploadResult.status === "UPLOADED") {
        proofImageUrl = uploadResult?.proofImage?.file_url || "";

        if (!proofImageUrl) {
          showError(
            "Tải ảnh minh chứng thất bại",
            "Ảnh đã được xử lý nhưng không nhận được đường dẫn lưu trữ. Vui lòng liên hệ ZMoms để được hỗ trợ.",
          );
          return;
        }
      } else if (uploadResult.status !== "UPLOAD_DISABLED") {
        showError(
          "Tải ảnh minh chứng thất bại",
          uploadResult?.message ||
            "Trạng thái tải ảnh không hợp lệ. Vui lòng thử lại.",
        );
        return;
      }

      const completeResponse = await fetch("/api/pancake/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...registrationPayload,
          proofImageUrl,
        }),
      });

      const completeResult = await completeResponse.json();

      if (completeResult?.status === "NOT_IN_ZALO") {
        showWarning(
          "Chưa tham gia Zalo OA",
          completeResult.message ||
            "Hiện tại bạn chưa tham gia Zalo OA của ZMoms.",
          completeResult.zaloUrl,
        );
        return;
      }

      if (completeResult?.status === "ALREADY_REGISTERED") {
        showWarning(
          "Thông tin đã được đăng ký",
          completeResult.message ||
            "Thông tin của bạn đã được đăng ký rồi. Vui lòng liên hệ ZMoms để được hỗ trợ.",
          completeResult.zaloUrl,
        );
        return;
      }

      if (completeResult?.status === "PANCAKE_SUCCESS_DATA_MASTER_FAILED") {
        showError(
          "Đăng ký chưa hoàn tất",
          completeResult.message ||
            "Pancake đã cập nhật thành công nhưng DATA_MASTER ghi thất bại. Vui lòng liên hệ ZMoms để được hỗ trợ, không gửi đăng ký lại.",
          completeResult.zaloUrl,
        );
        return;
      }

      if (
        !completeResponse.ok ||
        completeResult?.success !== true ||
        completeResult?.status !== "UPDATED"
      ) {
        showError(
          "Cập nhật thất bại",
          completeResult?.message ||
            "Cập nhật thông tin thất bại. Vui lòng thử lại hoặc liên hệ ZMoms để được hỗ trợ.",
          completeResult?.zaloUrl,
        );
        return;
      }

      const zaloUrl = completeResult.zaloUrl;

      setDialog({
        open: true,
        title: "Chúc mừng đăng ký thành công",
        message: completeResult.message || "Cảm ơn mẹ đã đăng ký cùng ZMoms!",
        status: "success",
        zaloUrl,
      });

      if (zaloUrl) {
        setTimeout(() => {
          window.location.href = zaloUrl;
        }, 1500);
      }
    } catch {
      showError(
        "Có lỗi xảy ra",
        "Có lỗi xảy ra khi đăng ký thông tin. Vui lòng thử lại hoặc liên hệ ZMoms để được hỗ trợ.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeDialog = () => {
    setDialog((current) => ({
      ...current,
      open: false,
    }));
  };

  return {
    fullName,
    phone,
    province,
    babyDate,
    referralCode,
    eventCode,
    availableEventCodes,

    setFullName,
    setPhone,
    setProvince,
    setBabyDate,
    setReferralCode,
    setEventCode,

    consentMember,
    consentAptaclub,
    consentMarketing,
    consentDanone,
    consentAptaclubZalo,

    setConsentMember,
    setConsentAptaclub,
    setConsentMarketing,
    setConsentDanone,
    setConsentAptaclubZalo,

    isSubmitting,
    handleSubmit,

    dialog,
    closeDialog,
  };
}
