"use client";

import { useState } from "react";
import type { RegistrationData } from "../types/registration";

export type RegistrationDialogState = {
  open: boolean;
  title: string;
  message: string;
  status: "success" | "warning" | "error";
  zaloUrl?: string;
};

const REFERRAL_CODE_REGEX = /^(PG|NHS|SPA|SALE)([0-9]{3})$/;

const isValidReferralCode = (code: string) => {
  if (!code) {
    return true;
  }

  const normalizedCode = code.trim().toUpperCase();
  const match = normalizedCode.match(REFERRAL_CODE_REGEX);

  if (!match) {
    return false;
  }

  const number = Number(match[2]);

  return number >= 1 && number <= 999;
};

export function useRegistrationForm() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("");
  const [babyDate, setBabyDate] = useState("");
  const [referralCode, setReferralCode] = useState("");

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

  const canSubmit = consentMember && !isSubmitting;

  const getFormData = (): RegistrationData => {
    return {
      fullName: fullName.trim(),
      phone: phone.trim(),
      province,
      babyDate,
      referralCode: referralCode.trim().toUpperCase(),
      consentMember,
      consentAptaclub,
      consentMarketing,
      consentDanone,
      consentAptaclubZalo,
      eligibleForDanoneCRM: consentAptaclub && consentDanone,
    };
  };

  const validate = () => {
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

    if (!province) {
      return "Vui lòng chọn tỉnh / thành.";
    }

    if (!babyDate) {
      return "Vui lòng chọn ngày dự sinh hoặc ngày sinh của bé.";
    }

    if (!isValidReferralCode(referralCode)) {
      return "Mã giới thiệu không hợp lệ.";
    }

    if (!consentMember) {
      return "Vui lòng đồng ý đăng ký hội viên để tiếp tục.";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const error = validate();

    if (error) {
      setDialog({
        open: true,
        title: "Thông tin chưa hợp lệ",
        message: error,
        status: "warning",
      });

      return;
    }

    if (isSubmitting) {
      return;
    }

    const data = getFormData();

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/pancake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
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

    setFullName,
    setPhone,
    setProvince,
    setBabyDate,
    setReferralCode,

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

    canSubmit,
    isSubmitting,
    handleSubmit,

    dialog,
    closeDialog,
  };
}
