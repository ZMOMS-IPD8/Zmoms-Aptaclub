"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ClassSessionList from "./components/ClassSessionList";
import ConsultationMemberStep from "./components/ConsultationMemberStep";
import ConsultationPhoneCheck from "./components/ConsultationPhoneCheck";
import ConsultationSuccess from "./components/ConsultationSuccess";
import PostSurvey from "./components/PostSurvey";
import PreSurvey from "./components/PreSurvey";
import {
  CLASS_SESSIONS,
  formatClassDateTime,
  getRegion,
  type ClassSession,
  type Region,
} from "./data/classSessions";

export type Member = {
  leadId: string;
  name: string;
  phone: string;
  province: string;
  dueDate: string;
  hasPreSurvey: boolean;
  hasPostSurvey: boolean;
  booking: {
    linkLopHoc: string;
    thoiGianThamDu: string;
  } | null;
  zaloUrl: string;
};

type Step =
  | "phone"
  | "member"
  | "schedule"
  | "preSurvey"
  | "postSurvey"
  | "success";

type SuccessMode = "booking" | "review";

export default function ConsultationPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [member, setMember] = useState<Member | null>(null);
  const [step, setStep] = useState<Step>("phone");
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null);
  const [memberAction, setMemberAction] = useState<
    "attended" | "notAttended" | null
  >(null);
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

      setMember(data.member);
      setSelectedClass(null);
      setMemberAction(null);
      setSuccessMode("booking");
      setStep("member");
    } catch {
      setError("Không thể kiểm tra thông tin. Mẹ vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleAttended = () => {
    clearStatus();

    if (!member) {
      return;
    }

    if (member.hasPostSurvey) {
      setError("Mẹ đã hoàn thành khảo sát sau buổi học rồi.");
      return;
    }

    if (!member.hasPreSurvey) {
      setError(
        "Mẹ cần hoàn thành khảo sát trước buổi học trước khi thực hiện khảo sát sau.",
      );
      return;
    }

    setMemberAction("attended");
    setStep("postSurvey");
  };

  const handleNotAttended = () => {
    clearStatus();
    setMemberAction("notAttended");
  };

  const handleAccept = () => {
    clearStatus();
    setSelectedClass(null);
    setStep("schedule");
  };

  const handleDecline = () => {
    clearStatus();
  };

  const handleSelectClass = (session: ClassSession) => {
    setSelectedClass(session);
    clearStatus();
  };

  const handleBackToMember = () => {
    clearStatus();
    setSelectedClass(null);
    setMemberAction(null);
    setStep("member");
  };

  const handleBook = async () => {
    if (!member) {
      return;
    }

    if (!selectedClass) {
      setError("Mẹ vui lòng chọn một buổi học.");
      return;
    }

    clearStatus();
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

      if (!response.ok) {
        setError(
          data?.message || "Không thể đăng ký lớp học. Mẹ vui lòng thử lại.",
        );
        return;
      }

      setMember((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          booking: {
            linkLopHoc: selectedClass.meetUrl,
            thoiGianThamDu,
          },
        };
      });

      setSuccessMode("booking");

      if (member.hasPreSurvey) {
        setStep("success");
      } else {
        setStep("preSurvey");
      }
    } catch {
      setError("Không thể đăng ký lớp học lúc này. Mẹ vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handlePreSurveyComplete = () => {
    clearStatus();

    setMember((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        hasPreSurvey: true,
      };
    });

    setSuccessMode("booking");
    setStep("success");
  };

  const handlePreSurveySkip = () => {
    clearStatus();
    setSuccessMode("booking");
    setStep("success");
  };

  const handlePostSurveyComplete = () => {
    clearStatus();

    setMember((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        hasPostSurvey: true,
      };
    });

    setSuccessMode("review");
    setStep("success");
  };

  const handlePostSurveyBack = () => {
    clearStatus();
    setMemberAction(null);
    setStep("member");
  };

  const reset = () => {
    setPhone("");
    setMember(null);
    setStep("phone");
    setSelectedClass(null);
    setMemberAction(null);
    setSuccessMode("booking");
    setLoading(false);
    setError("");
  };

  return (
    <main className="min-h-screen bg-[#F5F9FC] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-[560px]">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold text-[#12335B] sm:text-3xl">
            ĐĂNG KÝ THAM DỰ LỚP HỌC
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Quyền lợi dành riêng cho hội viên ZMOMS
          </p>
        </div>
        {step === "phone" && (
          <ConsultationPhoneCheck
            phone={phone}
            loading={loading}
            error={error}
            onChange={handlePhoneChange}
            onSubmit={handleCheckMember}
            onRegister={() => router.push("/")}
          />
        )}

        {step === "member" && member && (
          <ConsultationMemberStep
            member={member}
            region={region}
            memberAction={memberAction}
            error={error}
            loading={loading}
            onAttended={handleAttended}
            onNotAttended={handleNotAttended}
            onAccept={handleAccept}
            onDecline={handleDecline}
            onBack={() => {
              setMemberAction(null);
              clearStatus();
            }}
          />
        )}

        {step === "schedule" && member && region && (
          <ClassSessionList
            sessions={availableClasses}
            region={region}
            selectedId={selectedClass?.id || ""}
            onSelect={handleSelectClass}
            onConfirm={handleBook}
            onBack={handleBackToMember}
            loading={loading}
            error={error}
          />
        )}

        {step === "preSurvey" && member && selectedClass && (
          <PreSurvey
            member={member}
            selectedClass={selectedClass}
            onComplete={handlePreSurveyComplete}
            onSkip={handlePreSurveySkip}
          />
        )}

        {step === "postSurvey" &&
          member &&
          member.hasPreSurvey &&
          !member.hasPostSurvey && (
            <PostSurvey
              member={member}
              onComplete={handlePostSurveyComplete}
              onBack={handlePostSurveyBack}
            />
          )}

        {step === "success" && member && (
          <ConsultationSuccess
            member={member}
            selectedClass={selectedClass}
            mode={successMode}
            onReset={reset}
          />
        )}
      </div>
    </main>
  );
}
