"use client";

import { useRouter } from "next/navigation";
import ClassSessionList from "./components/ClassSessionList";
import ConsultationPhoneCheck from "./components/ConsultationPhoneCheck";
import ConsultationSuccess from "./components/ConsultationSuccess";
import MemberInfo from "./components/MemberInfo";
import PostSurvey from "./components/PostSurvey";
import PreSurvey from "./components/PreSurvey";
import BookingInfo from "./components/BookingInfo";
import { useConsultation } from "./hooks/useConsultation";

export default function ConsultationPage() {
  const router = useRouter();

  const {
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
    reset,
  } = useConsultation();

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
              <BookingInfo
                member={member}
                classHasStarted={classHasStarted}
                onPreSurvey={() => {
                  clearStatus();

                  const bookingClass = getExistingBookingClass(member.booking);

                  if (!bookingClass) {
                    return;
                  }

                  setSelectedClass(bookingClass);
                  setStep("preSurvey");
                }}
                onPostSurvey={() => {
                  clearStatus();
                  setStep("postSurvey");
                }}
                onBack={() => {
                  clearStatus();
                  setStep("phone");
                }}
                error={error}
              />
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
          />
        )}

        {step === "postSurvey" &&
          member &&
          member.booking &&
          member.hasPreSurvey &&
          classHasStarted && (
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
