export type DashboardFunnel = {
  total: number;
  lead: number;
  coData: number;
  coEdu: number;
  coLead: number;
  coSell: number;
};

export type DashboardOrder = {
  id: string;
  name: string;
  phone: string;
  orderCode: string;
  combo: string;
  orderDate: string;
  sellerCode: string;
  receiverName: string;
  receiverPhone: string;
  amount: number;
  deliveryStatus: string;
  paymentStatus: string;
  deliveredDate: string;
};

export type DashboardConsultation = {
  id: string;
  name: string;
  phone: string;
  consent: string;
  registeredAt: string;
  attendedAt: string;
  classLink: string;
  preSurvey: string;
  postSurvey: string;
  postGroup: string;
  postRating: string;
  supportNeed: string;
  childOrder: string;
  developmentPriority: string;
};

export type DashboardBabyCare = {
  id: string;
  name: string;
  phone: string;
  address: string;
  registeredAt: string;
  serviceTime: string;
  note: string;
  staff: string;
};

export type DashboardLead = {
  id?: string;
  name?: string | null;
  phone_number?: string | null;
  so_dien_thoai_dang_ky?: string | null;
  [key: string]: unknown;
};

export type DashboardGroupedConversion = {
  lead: number;
  consent: number;
  consentRate: number;
  nu: number;
  conversionRate: number;
};

export type DashboardDanoneAcquisition = {
  byEvent: Record<string, DashboardGroupedConversion>;
  byDate: Record<string, number>;
  byWeek: Record<string, number>;
  byMonth: Record<string, number>;
};

export type DashboardDanoneSegmentation = {
  pregnancy: Record<string, number>;
  motherStatus: Record<string, number>;
  province: Record<string, number>;
};

export type DashboardDanone = {
  coData: number;
  consent: number;
  consentRate: number;
  nu: number;
  conversionRate: number;
  acquisition: DashboardDanoneAcquisition;
  segmentation: DashboardDanoneSegmentation;
};

export type DashboardStats = {
  totalLeads: number;
  loadedLeads: number;

  funnel: DashboardFunnel;

  danone: DashboardDanone;

  ebook: {
    received: number;
  };

  consultation: {
    registered: number;
    attended: number;
  };

  babyCare: {
    registered: number;
    completed: number;
  };

  orders: {
    total: number;
    paid: number;
    delivered: number;
    unpaid: number;
    revenue: number;
  };

  registrations: {
    byDate: Record<string, number>;
    byProvince: Record<string, number>;
    bySource: Record<string, number>;
    byWeek: Record<string, number>;
    byMonth: Record<string, number>;
  };

  mothers: {
    byStatus: Record<string, number>;
  };

  ordersByCombo: Record<string, number>;

  paymentStatus: Record<string, number>;
};

export type DashboardOrdersData = {
  total: number;
  paid: number;
  delivered: number;
  unpaid: number;
  revenue: number;
  orders: DashboardOrder[];
};

export type DashboardConsultationData = {
  total: number;
  registered: number;
  attended: number;
  attendanceRate: number;
  consultations: DashboardConsultation[];
};

export type DashboardBabyCareData = {
  total: number;
  registered: number;
  completed: number;
  pending: number;
  completionRate: number;
  babyCare: DashboardBabyCare[];
};

export type DashboardLeadsData = {
  entries: DashboardLead[];
  total_entries: number;
};

export type DashboardCoSellData = {
  total: number;
  touchpoints: Record<string, number>;
};

export type DashboardApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type DashboardData = {
  stats: DashboardStats;
  orders: DashboardOrdersData;
  consultation: DashboardConsultationData;
  babyCare: DashboardBabyCareData;
  leads: DashboardLeadsData;
  coSell: DashboardCoSellData;
};
