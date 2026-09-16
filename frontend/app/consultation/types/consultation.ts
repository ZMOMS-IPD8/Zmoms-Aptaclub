import type { ClassSession } from "../data/classSessions";

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

export type ConsultationStep =
  | "phone"
  | "schedule"
  | "preSurvey"
  | "postSurvey"
  | "success";

export type SuccessMode = "booking" | "review";

export type ConsultationBooking = NonNullable<Member["booking"]>;

export type SelectedClass = ClassSession | null;
