import type { DashboardOrder } from "../types/dashboard";

export type CoSellFilters = {
  search: string;
  paymentStatus: "all" | "paid" | "unpaid";
  deliveryStatus: "all" | "delivered" | "pending";
};

export type CoSellDetailItem = DashboardOrder;

export type CoSellTableProps = {
  orders: DashboardOrder[];
  onSelect: (item: DashboardOrder) => void;
};
