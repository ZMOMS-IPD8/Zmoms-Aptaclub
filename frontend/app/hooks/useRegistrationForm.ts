"use client";

import { useState } from "react";
import type { RegistrationData } from "../types/registration";
import { isValidRegistrationReferralCode } from "../data/referralCodes";
import referralEvents from "../data/referralEvents.json";

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

  const events = referralEvents as Record<string, string[]>;

  return Array.isArray(events[normalizedCode]) ? events[normalizedCode] : [];
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

      latestDueDate.setMonth(latestDueDate.getMonth() + 9);
      latestDueDate.setHours(0, 0, 0, 0);

      return selectedDate <= latestDueDate;
    }

    const secondBirthday = new Date(
      selectedDate.getFullYear() + 2,
      selectedDate.getMonth(),
      selectedDate.getDate(),
    );

    secondBirthday.setHours(0, 0, 0, 0);

    return secondBirthday > today;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    const error = validate();

    if (error) {
      setDialog({
        open: true,
        title: "Thông tin chưa phù hợp",
        message: error,
        status: "warning",
      });

      return;
    }

    const data = getFormData();

    try {
      setIsSubmitting(true);

      const formData = new FormData();

      formData.append("fullName", data.fullName);
      formData.append("phone", data.phone);
      formData.append("province", data.province);
      formData.append("babyDate", data.babyDate);
      formData.append("referralCode", data.referralCode);
      formData.append("eventCode", data.eventCode);

      formData.append("consentMember", String(data.consentMember));
      formData.append("consentAptaclub", String(data.consentAptaclub));
      formData.append("consentMarketing", String(data.consentMarketing));
      formData.append("consentDanone", String(data.consentDanone));
      formData.append("consentAptaclubZalo", String(data.consentAptaclubZalo));

      const response = await fetch("/api/pancake", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result?.status === "NOT_IN_ZALO") {
        setDialog({
          open: true,
          title: "Chưa tham gia Zalo OA",
          message:
            result?.message ||
            "Hiện tại bạn chưa tham gia Zalo OA của ZMoms. Vui lòng vào Zalo OA và để lại số điện thoại Zalo của mình để tiếp tục.",
          status: "warning",
          zaloUrl: result?.zaloUrl,
        });

        return;
      }

      if (result?.status === "ALREADY_REGISTERED") {
        setDialog({
          open: true,
          title: "Thông tin đã được đăng ký",
          message:
            result?.message ||
            "Thông tin của bạn đã được đăng ký rồi. Vui lòng liên hệ ZMoms để được hỗ trợ.",
          status: "warning",
          zaloUrl: result?.zaloUrl,
        });

        return;
      }

      if (result?.status === "CONSENT_REQUIRED") {
        setDialog({
          open: true,
          title: "Chưa đủ điều kiện đăng ký",
          message:
            result?.message || "Vui lòng đồng ý đăng ký hội viên để tiếp tục.",
          status: "warning",
        });

        return;
      }

      if (result?.status === "INVALID_REFERRAL_CODE") {
        setDialog({
          open: true,
          title: "Mã giới thiệu không hợp lệ",
          message:
            result?.message || "Vui lòng kiểm tra lại mã giới thiệu của bạn.",
          status: "warning",
        });

        return;
      }

      if (result?.status === "INVALID_EVENT_CODE") {
        setDialog({
          open: true,
          title: "Mã sự kiện không hợp lệ",
          message:
            result?.message || "Mã sự kiện không phù hợp với mã giới thiệu.",
          status: "warning",
        });

        return;
      }

      if (result?.status === "INVALID_DATE") {
        setDialog({
          open: true,
          title: "Thông tin chưa phù hợp",
          message:
            result?.message ||
            "Thông tin ngày dự sinh hoặc ngày sinh của bé chưa phù hợp để đăng ký.",
          status: "warning",
        });

        return;
      }

      if (result?.status === "UPDATED") {
        const zaloUrl = result?.zaloUrl;

        setDialog({
          open: true,
          title: "Chúc mừng đăng ký thành công",
          message: "Cảm ơn mẹ đã đăng ký cùng ZMoms!",
          status: "success",
          zaloUrl,
        });

        if (zaloUrl) {
          setTimeout(() => {
            window.location.href = zaloUrl;
          }, 1500);
        }

        return;
      }

      if (!response.ok) {
        setDialog({
          open: true,
          title: "Cập nhật thất bại",
          message:
            result?.message ||
            "Cập nhật thông tin thất bại. Vui lòng thử lại hoặc liên hệ ZMoms để được hỗ trợ.",
          status: "error",
          zaloUrl: result?.zaloUrl,
        });

        return;
      }

      setDialog({
        open: true,
        title: "Cập nhật thành công",
        message:
          result?.message || "Thông tin của bạn đã được cập nhật thành công.",
        status: "success",
        zaloUrl: result?.zaloUrl,
      });

      if (result?.zaloUrl) {
        setTimeout(() => {
          window.location.href = result.zaloUrl;
        }, 1500);
      }
    } catch {
      setDialog({
        open: true,
        title: "Có lỗi xảy ra",
        message: "Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.",
        status: "error",
      });
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
