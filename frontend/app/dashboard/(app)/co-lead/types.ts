import type { DashboardBabyCare } from "../types/dashboard";

export type CoLeadFilters = {
  search: string;
  status: "all" | "completed" | "pending";
};

export type CoLeadDetailItem = DashboardBabyCare;

export type CoLeadTableProps = {
  babyCare: DashboardBabyCare[];
  onSelect: (item: DashboardBabyCare) => void;
};
