"use client";

import BenefitSection from "./BenefitSection";
import MemberInfo from "./MemberInfo";
import AttendanceChoice from "./AttendanceChoice";
import type { Member } from "../page";
import type { Region } from "../data/classSessions";

type Props = {
  member: Member;
  region: Region | null;
  memberAction: "attended" | "notAttended" | null;
  error: string;
  loading: boolean;
  onAttended: () => void;
  onNotAttended: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onBack: () => void;
};

export default function ConsultationMemberStep({
  member,
  region,
  memberAction,
  error,
  loading,
  onAttended,
  onNotAttended,
  onAccept,
  onDecline,
  onBack,
}: Props) {
  return (
    <div className="space-y-4">
      <MemberInfo member={member} region={region} />

      {!memberAction && (
        <AttendanceChoice
          onAttended={onAttended}
          onNotAttended={onNotAttended}
          hasPreSurvey={member.hasPreSurvey}
          hasPostSurvey={member.hasPostSurvey}
          error={error}
        />
      )}

      {memberAction === "notAttended" && (
        <>
          <BenefitSection
            onAccept={onAccept}
            onDecline={onDecline}
            loading={loading}
            error={error}
            message=""
            booking={member.booking}
            zaloUrl={member.zaloUrl}
          />

          <button
            type="button"
            onClick={onBack}
            className="w-full text-sm font-bold text-gray-500 hover:text-[#12335B]"
          >
            ← Quay lại lựa chọn
          </button>
        </>
      )}
    </div>
  );
}
