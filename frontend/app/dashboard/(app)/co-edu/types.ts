import type { DashboardConsultation } from "../types/dashboard";

export type CoEduFilters = {
  search: string;
  status: "all" | "attended" | "pending";
};

export type CoEduDetailItem = DashboardConsultation;

export type CoEduTableProps = {
  consultations: DashboardConsultation[];
  onSelect: (item: DashboardConsultation) => void;
};
