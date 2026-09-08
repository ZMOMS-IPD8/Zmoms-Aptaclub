"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ClassSessionList from "./components/ClassSessionList";
import ConsultationPhoneCheck from "./components/ConsultationPhoneCheck";
import ConsultationSuccess from "./components/ConsultationSuccess";
import MemberInfo from "./components/MemberInfo";
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

type Step = "phone" | "schedule" | "preSurvey" | "postSurvey" | "success";

type SuccessMode = "booking" | "review";

export default function ConsultationPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [member, setMember] = useState<Member | null>(null);
  const [step, setStep] = useState<Step>("phone");
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

  const clearStatus = () => {
    setError("");
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value.replace(/\D/g, "").slice(0, 10));
    clearStatus();
  };

  const getExistingBookingClass = (
    booking: Member["booking"],
  ): ClassSession | null => {
    if (!booking) {
      return null;
    }

    return (
      CLASS_SESSIONS.find(
        (session) =>
          session.meetUrl === booking.linkLopHoc &&
          formatClassDateTime(session) === booking.thoiGianThamDu,
      ) || null
    );
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

      setMember(nextMember);
      setSelectedClass(getExistingBookingClass(nextMember.booking));

      if (nextMember.booking && nextMember.hasPostSurvey) {
        setSuccessMode("review");
        setStep("success");
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

  const handleBook = async () => {
    if (!member) {
      return;
    }

    if (member.booking) {
      setError("Mẹ đã đăng ký buổi tư vấn trước đó và không cần đăng ký lại.");
      return;
    }

    if (!selectedClass) {
      setError("Mẹ vui lòng chọn một buổi tư vấn.");
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

      if (response.status === 409 && data?.booking) {
        const existingBooking = {
          linkLopHoc: data.booking.linkLopHoc,
          thoiGianThamDu: data.booking.thoiGianThamDu,
        };

        setMember((current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            booking: existingBooking,
          };
        });

        setSelectedClass(getExistingBookingClass(existingBooking));

        setError(
          "Mẹ đã đăng ký buổi tư vấn trước đó và không cần đăng ký lại.",
        );

        setStep("schedule");
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
        linkLopHoc: selectedClass.meetUrl,
        thoiGianThamDu,
      };

      setMember((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          booking,
        };
      });

      setSuccessMode("booking");

      if (member.hasPreSurvey) {
        setStep("success");
      } else {
        setStep("preSurvey");
      }
    } catch {
      setError("Không thể đăng ký buổi tư vấn lúc này. Mẹ vui lòng thử lại.");
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

  const existingBooking = member?.booking || null;

  return (
    <main className="min-h-screen bg-[#F5F9FC] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-[560px]">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold text-[#12335B] sm:text-3xl">
            ĐĂNG KÝ TƯ VẤN ONLINE: &quot;CÁCH XỬ TRÍ CÁC TÌNH HUỐNG THƯỜNG GẶP
            KHI NUÔI CON BẰNG SỮA MẸ&quot;
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            QUYỀN LỢI 1 DÀNH CHO HỘI VIÊN CLB
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

        {step === "schedule" && member && region && (
          <div className="space-y-4">
            <MemberInfo member={member} region={region} />

            {existingBooking ? (
              <section className="rounded-3xl border border-[#BFE7F5] bg-white p-5 shadow-sm sm:p-7">
                <p className="text-xs font-bold uppercase tracking-wide text-[#18A8DC]">
                  Thông tin đăng ký
                </p>

                <h2 className="mt-1 text-xl font-extrabold text-[#12335B]">
                  Mẹ đã đăng ký buổi tư vấn
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Mẹ không cần đăng ký lại. Thông tin buổi tư vấn của mẹ:
                </p>

                <div className="mt-5 rounded-2xl bg-[#F5F9FC] p-4">
                  <p className="text-xs text-gray-500">Thời gian tham dự</p>

                  <p className="mt-1 text-sm font-bold text-[#12335B]">
                    {formatBookingDateTime(existingBooking.thoiGianThamDu)}
                  </p>
                </div>

                <a
                  href={existingBooking.linkLopHoc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-[#18A8DC] text-sm font-bold text-white hover:bg-[#1297C8]"
                >
                  THAM GIA BUỔI TƯ VẤN
                </a>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-[#D8E1EB] bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-[#18A8DC]">
                          Khảo sát 1
                        </p>

                        <p className="mt-1 text-sm font-bold text-[#12335B]">
                          Khảo sát trước buổi tư vấn
                        </p>

                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          Thông tin giúp chuyên gia hiểu hơn về tình trạng và
                          nhu cầu của mẹ.
                        </p>
                      </div>

                      {member.hasPreSurvey && (
                        <span className="shrink-0 rounded-full bg-[#E8F8FD] px-3 py-1 text-[11px] font-bold text-[#18A8DC]">
                          ĐÃ HOÀN THÀNH
                        </span>
                      )}
                    </div>

                    {member.hasPreSurvey ? (
                      <div className="mt-3 rounded-xl bg-[#F5F9FC] px-4 py-3 text-center text-xs font-bold text-gray-500">
                        Mẹ đã hoàn thành khảo sát trước buổi tư vấn
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          clearStatus();

                          const bookingClass = getExistingBookingClass(
                            member.booking,
                          );

                          if (!bookingClass) {
                            setError("Không tìm thấy thông tin buổi tư vấn.");
                            return;
                          }

                          setSelectedClass(bookingClass);
                          setStep("preSurvey");
                        }}
                        className="mt-3 h-11 w-full rounded-xl bg-[#12335B] text-sm font-bold text-white hover:bg-[#0D2949]"
                      >
                        TIẾP TỤC KHẢO SÁT TRƯỚC
                      </button>
                    )}
                  </div>

                  <div className="rounded-2xl border border-[#D8E1EB] bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-[#18A8DC]">
                          Khảo sát 2
                        </p>

                        <p className="mt-1 text-sm font-bold text-[#12335B]">
                          Đánh giá sau buổi tư vấn
                        </p>

                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          Mẹ có thể thực hiện sau khi đã hoàn thành khảo sát
                          trước buổi tư vấn.
                        </p>
                      </div>

                      {member.hasPostSurvey && (
                        <span className="shrink-0 rounded-full bg-[#E8F8FD] px-3 py-1 text-[11px] font-bold text-[#18A8DC]">
                          ĐÃ HOÀN THÀNH
                        </span>
                      )}
                    </div>

                    {member.hasPostSurvey ? (
                      <div className="mt-3 rounded-xl bg-[#F5F9FC] px-4 py-3 text-center text-xs font-bold text-gray-500">
                        Mẹ đã hoàn thành đánh giá sau buổi tư vấn
                      </div>
                    ) : !member.hasPreSurvey ? (
                      <div className="mt-3 rounded-xl bg-gray-50 px-4 py-3 text-center text-xs font-semibold text-gray-400">
                        Mẹ cần hoàn thành khảo sát trước buổi tư vấn trước
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          clearStatus();
                          setStep("postSurvey");
                        }}
                        className="mt-3 h-11 w-full rounded-xl border border-[#12335B] text-sm font-bold text-[#12335B] hover:bg-[#F5F9FC]"
                      >
                        ĐÁNH GIÁ SAU BUỔI TƯ VẤN
                      </button>
                    )}
                  </div>
                </div>

                {error && (
                  <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => {
                    clearStatus();
                    setStep("phone");
                  }}
                  className="mt-4 h-10 w-full text-sm font-bold text-gray-500 hover:text-[#12335B]"
                >
                  ← Kiểm tra số điện thoại khác
                </button>
              </section>
            ) : (
              <ClassSessionList
                sessions={availableClasses}
                region={region}
                selectedId={selectedClass?.id || ""}
                onSelect={handleSelectClass}
                onConfirm={handleBook}
                onBack={() => {
                  clearStatus();
                  setStep("phone");
                }}
                loading={loading}
                error={error}
              />
            )}
          </div>
        )}

        {step === "preSurvey" && member && selectedClass && (
          <PreSurvey
            member={member}
            selectedClass={selectedClass}
            onComplete={handlePreSurveyComplete}
            onSkip={handlePreSurveySkip}
          />
        )}

        {step === "postSurvey" && member && member.hasPreSurvey && (
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

function formatBookingDateTime(value: string) {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );

  if (!match) {
    return value;
  }

  return `${match[3]}/${match[2]}/${match[1]} · ${match[4]}:${match[5]}`;
}
