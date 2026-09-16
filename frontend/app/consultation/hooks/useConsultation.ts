"use client";

import { useMemo, useState } from "react";
import {
  CLASS_SESSIONS,
  formatClassDateTime,
  getRegion,
  type ClassSession,
  type Region,
} from "../data/classSessions";
import type {
  ConsultationStep,
  Member,
  SuccessMode,
} from "../types/consultation";
import {
  hasClassStarted,
  normalizeBookingDateTime,
} from "../utils/consultationDate";

export function useConsultation() {
  const [phone, setPhone] = useState("");
  const [member, setMember] = useState<Member | null>(null);
  const [step, setStep] = useState<ConsultationStep>("phone");
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null);
  const [successMode, setSuccessMode] = useState<SuccessMode>("booking");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const region: Region | null = useMemo(() => {
    if (!member?.province) {
      return null;
    }

    return getRegion(member.province);
  }, [member]);

  const availableClasses = useMemo(() => {
    if (!region) {
      return [];
    }

    return CLASS_SESSIONS.filter((item) => item.region === region);
  }, [region]);

  const existingBooking = member?.booking ?? null;

  const getExistingBookingClass = (
    booking: Member["booking"],
  ): ClassSession | null => {
    if (!booking) {
      return null;
    }

    const bookingTime = normalizeBookingDateTime(booking.thoiGianThamDu);

    if (!bookingTime) {
      return null;
    }

    const matchedSession = CLASS_SESSIONS.find(
      (session) =>
        session.meetUrl === booking.linkLopHoc &&
        formatClassDateTime(session) === bookingTime,
    );

    if (matchedSession) {
      return matchedSession;
    }

    const date = bookingTime.slice(0, 10);
    const time = bookingTime.slice(11, 16);

    return {
      id: "existing-booking",
      region: member?.province ? getRegion(member.province) : "south",
      date,
      time,
      meetUrl: booking.linkLopHoc,
    };
  };

  const classHasStarted = existingBooking
    ? hasClassStarted(existingBooking.thoiGianThamDu)
    : false;

  const clearStatus = () => {
    setError("");
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value.replace(/\D/g, "").slice(0, 10));
    clearStatus();
  };

  const handleCheckMember = async () => {
    clearStatus();

    if (!/^0\d{9}$/.test(phone)) {
      setError("Mẹ vui lòng nhập số điện thoại hợp lệ.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/member-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.registered || !data?.member) {
        setError(
          data?.message ||
            "Không tìm thấy thông tin hội viên với số điện thoại này.",
        );
        return;
      }

      const nextMember = data.member as Member;
      const bookingClass = getExistingBookingClass(nextMember.booking);

      setMember(nextMember);
      setSelectedClass(bookingClass);

      if (nextMember.booking && nextMember.hasPostSurvey) {
        setSuccessMode("review");
        setStep("success");
        return;
      }

      if (nextMember.booking && !nextMember.hasPreSurvey) {
        if (!bookingClass) {
          setError("Không xác định được thông tin buổi tư vấn của mẹ.");
          setStep("schedule");
          return;
        }

        setSuccessMode("booking");
        setStep("preSurvey");
        return;
      }

      if (nextMember.booking) {
        setSuccessMode("booking");
        setStep("schedule");
        return;
      }

      setSuccessMode("booking");
      setStep("schedule");
    } catch {
      setError("Không thể kiểm tra thông tin. Mẹ vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClass = (session: ClassSession) => {
    setSelectedClass(session);
    clearStatus();
  };

  const handleBook = () => {
    clearStatus();

    if (!member) {
      setError("Không xác định được thông tin hội viên.");
      return;
    }

    if (member.booking) {
      setError("Mẹ đã đăng ký buổi tư vấn trước đó.");
      return;
    }

    if (!selectedClass) {
      setError("Mẹ vui lòng chọn một buổi tư vấn.");
      return;
    }

    setStep("preSurvey");
  };

  const handlePreSurveyComplete = async () => {
    if (!member) {
      setError("Không xác định được thông tin hội viên.");
      return;
    }

    if (!selectedClass) {
      setError("Mẹ vui lòng chọn một buổi tư vấn.");
      return;
    }

    clearStatus();

    if (member.booking) {
      setMember((current) =>
        current
          ? {
              ...current,
              hasPreSurvey: true,
            }
          : current,
      );

      setSuccessMode("booking");
      setStep("schedule");
      return;
    }

    setLoading(true);

    const thoiGianThamDu = formatClassDateTime(selectedClass);

    try {
      const response = await fetch("/api/book-class", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: member.phone,
          linkLopHoc: selectedClass.meetUrl,
          thoiGianThamDu,
        }),
      });

      const data = await response.json();

      if (response.status === 409 && data?.booking) {
        const existingBooking = {
          linkLopHoc: String(data.booking.linkLopHoc ?? "").trim(),
          thoiGianThamDu: String(data.booking.thoiGianThamDu ?? "").trim(),
        };

        const bookingClass = getExistingBookingClass(existingBooking);

        setMember((current) =>
          current
            ? {
                ...current,
                hasPreSurvey: true,
                booking: existingBooking,
              }
            : current,
        );

        setSelectedClass(bookingClass ?? selectedClass);
        setSuccessMode("booking");
        setStep("success");
        return;
      }

      if (!response.ok) {
        setError(
          data?.message ||
            "Không thể đăng ký buổi tư vấn. Mẹ vui lòng thử lại.",
        );
        return;
      }

      const booking = {
        linkLopHoc: data?.booking?.linkLopHoc || selectedClass.meetUrl,
        thoiGianThamDu: data?.booking?.thoiGianThamDu || thoiGianThamDu,
      };

      setMember((current) =>
        current
          ? {
              ...current,
              hasPreSurvey: true,
              booking,
            }
          : current,
      );

      setSelectedClass(selectedClass);
      setSuccessMode("booking");
      setStep("success");
    } catch {
      setError("Không thể đăng ký buổi tư vấn lúc này. Mẹ vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handlePreSurveySkip = () => {
    clearStatus();
    setError("Mẹ vui lòng hoàn thành khảo sát trước khi đăng ký.");
  };

  const handlePostSurveyComplete = () => {
    clearStatus();

    setMember((current) =>
      current
        ? {
            ...current,
            hasPostSurvey: true,
          }
        : current,
    );

    setSuccessMode("review");
    setStep("success");
  };

  const handlePostSurveyBack = () => {
    clearStatus();

    if (member?.booking) {
      setStep("schedule");
      return;
    }

    setStep("phone");
  };

  const reset = () => {
    setPhone("");
    setMember(null);
    setStep("phone");
    setSelectedClass(null);
    setSuccessMode("booking");
    setLoading(false);
    setError("");
  };

  return {
    phone,
    member,
    step,
    selectedClass,
    successMode,
    loading,
    error,
    region,
    availableClasses,
    existingBooking,
    classHasStarted,
    clearStatus,
    handlePhoneChange,
    handleCheckMember,
    handleSelectClass,
    handleBook,
    handlePreSurveyComplete,
    handlePreSurveySkip,
    handlePostSurveyComplete,
    handlePostSurveyBack,
    getExistingBookingClass,
    setSelectedClass,
    setStep,
    setError,
    reset,
  };
}
