"use client";

import { useState } from "react";
import type { RegistrationData } from "../types/registration";

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

  const canSubmit = consentMember && !isSubmitting;

  const getFormData = (): RegistrationData => {
    return {
      fullName: fullName.trim(),
      phone: phone.trim(),
      province,
      babyDate,
      referralCode: referralCode.trim(),

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

    if (!phone.trim()) {
      return "Vui lòng nhập số điện thoại.";
    }

    if (!province) {
      return "Vui lòng chọn tỉnh / thành.";
    }

    if (!babyDate) {
      return "Vui lòng chọn ngày dự sinh hoặc ngày sinh của bé.";
    }

    if (!consentMember) {
      return "Vui lòng đồng ý đăng ký hội viên để tiếp tục.";
    }

    return null;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const error = validate();

    if (error) {
      alert(error);
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

      if (!response.ok) {
        throw new Error(
          result?.message || "Không thể hoàn tất đăng ký."
        );
      }

      console.log("Pancake result:", result);

      alert("Đăng ký thành công!");
    } catch (error) {
      console.error("Registration error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
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
  };
}