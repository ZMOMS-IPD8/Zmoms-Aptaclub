import type {
  DashboardBabyCare,
  DashboardConsultation,
  DashboardOrder,
  DashboardStats,
} from "../../app/dashboard/(app)/types/dashboard";

type PancakeLead = Record<string, unknown>;

function getFieldValue(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }

  if (value && typeof value === "object" && "value" in value) {
    return String((value as { value?: unknown }).value ?? "").trim();
  }

  return "";
}

function getNumericValue(value: unknown): number {
  const normalized = getFieldValue(value);

  if (!normalized) {
    return 0;
  }

  const cleaned = normalized.replace(/[^\d.,-]/g, "");

  if (!cleaned) {
    return 0;
  }

  const number =
    cleaned.includes(".") && cleaned.includes(",")
      ? Number(cleaned.replace(/\./g, "").replace(",", "."))
      : Number(cleaned.replace(/[.,]/g, ""));

  return Number.isFinite(number) ? number : 0;
}

function normalizeStatus(value: unknown): string {
  return getFieldValue(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isPaidStatus(value: unknown): boolean {
  const status = normalizeStatus(value);

  return (
    status.includes("da thanh toan") ||
    status.includes("paid") ||
    status.includes("success") ||
    status.includes("thanh toan thanh cong")
  );
}

function isDeliveredStatus(value: unknown): boolean {
  const status = normalizeStatus(value);

  return (
    status.includes("giao thanh cong") ||
    status.includes("da giao") ||
    status.includes("delivered") ||
    status.includes("successful delivery")
  );
}

function hasSuccessfulDelivery(lead: PancakeLead): boolean {
  const deliveredDate = getFieldValue(lead.ngay_giao_thanh_cong);

  if (deliveredDate) {
    return true;
  }

  return isDeliveredStatus(lead.trang_thai_giao_hang);
}

function hasField(lead: PancakeLead, field: string): boolean {
  return getFieldValue(lead[field]) !== "";
}

function isCoData(lead: PancakeLead): boolean {
  return hasField(lead, "thoi_gian_dang_ky");
}

function isCoEdu(lead: PancakeLead): boolean {
  return isCoData(lead) && hasField(lead, "thoi_gian_dang_ky_lop");
}

function isCoLead(lead: PancakeLead): boolean {
  return isCoData(lead) && hasField(lead, "thoi_gian_dang_ky_tam_be");
}

function isOrder(lead: PancakeLead): boolean {
  return hasField(lead, "ngay_dat_hang") && hasField(lead, "ma_don_hang");
}

function isNU(lead: PancakeLead): boolean {
  return isCoData(lead) && isOrder(lead) && hasSuccessfulDelivery(lead);
}

function isCoSell(lead: PancakeLead): boolean {
  return isNU(lead);
}

function isDanoneConsent(lead: PancakeLead): boolean {
  const value = normalizeStatus(lead.chia_se_de_dang_ky_aptaclub);

  return (
    value === "true" ||
    value === "yes" ||
    value === "co" ||
    value === "dong y" ||
    value === "1"
  );
}

function formatOrder(lead: PancakeLead): DashboardOrder {
  return {
    id: getFieldValue(lead.id),
    name: getFieldValue(lead.ho_va_ten_lien_he) || getFieldValue(lead.name),
    phone:
      getFieldValue(lead.so_dien_thoai_dang_ky) ||
      getFieldValue(lead.phone_number),
    orderCode: getFieldValue(lead.ma_don_hang),
    combo: getFieldValue(lead.ten_combo),
    orderDate: getFieldValue(lead.ngay_dat_hang),
    sellerCode: getFieldValue(lead.ma_nguoi_ban),
    receiverName: getFieldValue(lead.ten_nguoi_nhan),
    receiverPhone: getFieldValue(lead.so_dien_thoai_giao_hang),
    amount: getNumericValue(lead.gia_tien),
    deliveryStatus: getFieldValue(lead.trang_thai_giao_hang),
    paymentStatus: getFieldValue(lead.trang_thai_thanh_toan),
    deliveredDate: getFieldValue(lead.ngay_giao_thanh_cong),
  };
}

function formatConsultation(lead: PancakeLead): DashboardConsultation {
  return {
    id: getFieldValue(lead.id),
    name: getFieldValue(lead.ho_va_ten_lien_he) || getFieldValue(lead.name),
    phone:
      getFieldValue(lead.so_dien_thoai_dang_ky) ||
      getFieldValue(lead.phone_number),
    consent: getFieldValue(lead.dong_y_tham_du_lop_hoc),
    registeredAt: getFieldValue(lead.thoi_gian_dang_ky_lop),
    attendedAt: getFieldValue(lead.thoi_gian_tham_du),
    classLink: getFieldValue(lead.link_lop_hoc),
    preSurvey: getFieldValue(lead.truoc_khi_tham_gia_lop_hoc),
    postSurvey: getFieldValue(lead.sau_khi_tham_gia_lop_hoc),
    postGroup: getFieldValue(lead.post_group),
    postRating: getFieldValue(lead.post_rating),
    supportNeed: getFieldValue(lead.nhu_cau_ho_tro_ncbsme),
    childOrder: getFieldValue(lead.thu_tu_con),
    developmentPriority: getFieldValue(lead.uu_tien_phat_trien_be),
  };
}

function formatBabyCare(lead: PancakeLead): DashboardBabyCare {
  return {
    id: getFieldValue(lead.id),
    name: getFieldValue(lead.ho_va_ten_lien_he) || getFieldValue(lead.name),
    phone:
      getFieldValue(lead.so_dien_thoai_dang_ky) ||
      getFieldValue(lead.phone_number),
    address: getFieldValue(lead.dia_chi_tam_be),
    registeredAt: getFieldValue(lead.thoi_gian_dang_ky_tam_be),
    serviceTime: getFieldValue(lead.thoi_gian_tam_be),
    note: getFieldValue(lead.ghi_chu_tam_be),
    staff: getFieldValue(lead.ten_nhan_vien_tam_be),
  };
}

function countByField(
  leads: PancakeLead[],
  field: string,
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const lead of leads) {
    const value = getFieldValue(lead[field]) || "Chưa có";

    result[value] = (result[value] || 0) + 1;
  }

  return result;
}

function countByDate(
  leads: PancakeLead[],
  field: string,
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const lead of leads) {
    const value = getFieldValue(lead[field]);

    if (!value) {
      continue;
    }

    const isoDate = new Date(value);

    if (!Number.isNaN(isoDate.getTime())) {
      const date = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(isoDate);

      result[date] = (result[date] || 0) + 1;
      continue;
    }

    const match = value.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);

    if (!match) {
      continue;
    }

    const day = match[1].padStart(2, "0");
    const month = match[2].padStart(2, "0");
    const year = match[3];

    const date = `${year}-${month}-${day}`;

    result[date] = (result[date] || 0) + 1;
  }

  return result;
}

function parseDate(value: unknown): Date | null {
  const normalized = getFieldValue(value);

  if (!normalized) {
    return null;
  }

  const isoDate = new Date(normalized);

  if (!Number.isNaN(isoDate.getTime())) {
    return isoDate;
  }

  const match = normalized.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const date = new Date(year, month - 1, day);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getWeekKey(value: unknown): string {
  const date = parseDate(value);

  if (!date) {
    return "";
  }

  const utcDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );

  const day = utcDate.getUTCDay() || 7;

  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);

  const year = utcDate.getUTCFullYear();

  const yearStart = new Date(Date.UTC(year, 0, 1));

  const week = Math.ceil(
    ((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );

  return `${year}-W${String(week).padStart(2, "0")}`;
}

function getMonthKey(value: unknown): string {
  const date = parseDate(value);

  if (!date) {
    return "";
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

function countByPeriod(
  leads: PancakeLead[],
  field: string,
  period: "week" | "month",
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const lead of leads) {
    const key =
      period === "week" ? getWeekKey(lead[field]) : getMonthKey(lead[field]);

    if (!key) {
      continue;
    }

    result[key] = (result[key] || 0) + 1;
  }

  return result;
}

function calculateConversion(
  baseCount: number,
  convertedCount: number,
): number {
  if (baseCount <= 0) {
    return 0;
  }

  return Number(((convertedCount / baseCount) * 100).toFixed(2));
}

function getGroupedConversion(leads: PancakeLead[], groupField: string) {
  const groups: Record<
    string,
    {
      lead: number;
      consent: number;
      nu: number;
    }
  > = {};

  for (const lead of leads) {
    const group = getFieldValue(lead[groupField]) || "Chưa có";

    if (!groups[group]) {
      groups[group] = {
        lead: 0,
        consent: 0,
        nu: 0,
      };
    }

    groups[group].lead += 1;

    if (isDanoneConsent(lead)) {
      groups[group].consent += 1;
    }

    if (isNU(lead)) {
      groups[group].nu += 1;
    }
  }

  return Object.fromEntries(
    Object.entries(groups).map(([group, value]) => [
      group,
      {
        lead: value.lead,
        consent: value.consent,
        consentRate: calculateConversion(value.lead, value.consent),
        nu: value.nu,
        conversionRate: calculateConversion(value.lead, value.nu),
      },
    ]),
  );
}

function getFunnelStats(leads: PancakeLead[]): DashboardStats["funnel"] {
  const coDataLeads = leads.filter(isCoData);

  return {
    total: leads.length,
    lead: leads.filter((lead) => !isCoData(lead)).length,
    coData: coDataLeads.length,
    coEdu: coDataLeads.filter(isCoEdu).length,
    coLead: coDataLeads.filter(isCoLead).length,
    coSell: coDataLeads.filter(isCoSell).length,
  };
}

function getPregnancySegmentation(
  leads: PancakeLead[],
): Record<string, number> {
  const result: Record<string, number> = {
    "Đang mang thai": 0,
    "Đã sinh": 0,
    "Không xác định": 0,
  };

  for (const lead of leads) {
    const status = normalizeStatus(lead.tinh_trang_me);

    if (status.includes("mang thai")) {
      result["Đang mang thai"] += 1;
      continue;
    }

    if (status.includes("da sinh")) {
      result["Đã sinh"] += 1;
      continue;
    }

    const dateValue = getFieldValue(lead.ngay_du_sinh_hoac_ngay_sinh_cua_be);

    if (dateValue) {
      const date = parseDate(dateValue);

      if (date) {
        if (date.getTime() > Date.now()) {
          result["Đang mang thai"] += 1;
        } else {
          result["Đã sinh"] += 1;
        }

        continue;
      }
    }

    result["Không xác định"] += 1;
  }

  return result;
}

export function transformDashboardData(
  entries: PancakeLead[],
  totalEntries: number,
) {
  const coDataLeads = entries.filter(isCoData);
  const coEduLeads = coDataLeads.filter(isCoEdu);
  const coLeadLeads = coDataLeads.filter(isCoLead);
  const coSellLeads = coDataLeads.filter(isCoSell);
  const nuLeads = coDataLeads.filter(isNU);

  const orders = entries.filter(isOrder).map(formatOrder);

  const paidOrders = orders.filter((order) =>
    isPaidStatus(order.paymentStatus),
  );

  const deliveredOrders = orders.filter(
    (order) =>
      order.deliveredDate !== "" || isDeliveredStatus(order.deliveryStatus),
  );

  const revenue = paidOrders.reduce((total, order) => total + order.amount, 0);

  const consultations = coEduLeads.map(formatConsultation);

  const consultationRegistered = consultations.filter(
    (item) => item.registeredAt !== "",
  );

  const preSurveyCompleted = consultations.filter(
    (item) => item.preSurvey !== "",
  );

  const postSurveyCompleted = consultations.filter(
    (item) => item.postSurvey !== "",
  );

  const consultationAttended = consultations.filter(
    (item) => item.postSurvey !== "",
  );

  const babyCare = coLeadLeads.map(formatBabyCare);

  const babyCareRegistered = babyCare.filter(
    (item) => item.registeredAt !== "",
  );

  const babyCareCompleted = babyCare.filter((item) => item.staff !== "");

  const funnel = getFunnelStats(entries);

  const registrationsByDate = countByDate(coDataLeads, "thoi_gian_dang_ky");

  const registrationsByProvince = countByField(coDataLeads, "thanh_pho");

  const registrationsBySource = countByField(coDataLeads, "nguon_dang_ky");

  const registrationsByTouchpoint = countByField(coDataLeads, "nguon_mua_hang");

  const registrationsByWeek = countByPeriod(
    coDataLeads,
    "thoi_gian_dang_ky",
    "week",
  );

  const registrationsByMonth = countByPeriod(
    coDataLeads,
    "thoi_gian_dang_ky",
    "month",
  );

  const mothersByStatus = countByField(coDataLeads, "tinh_trang_me");

  const byEvent = getGroupedConversion(coDataLeads, "nguon_dang_ky");

  const byTouchpoint = getGroupedConversion(coDataLeads, "nguon_mua_hang");

  const consentCount = coDataLeads.filter(isDanoneConsent).length;

  const consentRate = calculateConversion(coDataLeads.length, consentCount);

  const conversionRate = calculateConversion(
    coDataLeads.length,
    nuLeads.length,
  );

  const ordersByCombo = countByField(
    orders.map((order) => ({
      ten_combo: order.combo,
    })),
    "ten_combo",
  );

  const paymentStatus = countByField(
    orders.map((order) => ({
      trang_thai_thanh_toan: order.paymentStatus,
    })),
    "trang_thai_thanh_toan",
  );

  return {
    stats: {
      totalLeads: totalEntries,
      loadedLeads: entries.length,

      funnel,

      danone: {
        coData: coDataLeads.length,
        consent: consentCount,
        consentRate,
        nu: nuLeads.length,
        conversionRate,

        acquisition: {
          byEvent,
          byTouchpoint,
          byDate: registrationsByDate,
          byWeek: registrationsByWeek,
          byMonth: registrationsByMonth,
        },

        segmentation: {
          pregnancy: getPregnancySegmentation(coDataLeads),
          motherStatus: mothersByStatus,
          province: registrationsByProvince,
        },
      },

      ebook: {
        received: coDataLeads.filter((lead) =>
          hasField(lead, "email_nhan_ebook"),
        ).length,
      },

      consultation: {
        registered: consultationRegistered.length,
        attended: consultationAttended.length,
      },

      babyCare: {
        registered: babyCareRegistered.length,
        completed: babyCareCompleted.length,
      },

      orders: {
        total: orders.length,
        paid: paidOrders.length,
        delivered: deliveredOrders.length,
        unpaid: orders.length - paidOrders.length,
        revenue,
      },

      registrations: {
        byDate: registrationsByDate,
        byProvince: registrationsByProvince,
        bySource: registrationsBySource,
        byTouchpoint: registrationsByTouchpoint,
        byWeek: registrationsByWeek,
        byMonth: registrationsByMonth,
      },

      mothers: {
        byStatus: mothersByStatus,
      },

      ordersByCombo,
      paymentStatus,
    },

    orders: {
      total: orders.length,
      paid: paidOrders.length,
      delivered: deliveredOrders.length,
      unpaid: orders.length - paidOrders.length,
      revenue,
      orders,
    },

    consultation: {
      total: consultations.length,
      registered: consultationRegistered.length,
      attended: consultationAttended.length,
      preSurveyCompleted: preSurveyCompleted.length,
      postSurveyCompleted: postSurveyCompleted.length,
      attendanceRate:
        consultationRegistered.length > 0
          ? Number(
              (
                (consultationAttended.length / consultationRegistered.length) *
                100
              ).toFixed(2),
            )
          : 0,
      consultations,
    },

    babyCare: {
      total: babyCare.length,
      registered: babyCareRegistered.length,
      completed: babyCareCompleted.length,
      pending: Math.max(
        babyCareRegistered.length - babyCareCompleted.length,
        0,
      ),
      completionRate:
        babyCareRegistered.length > 0
          ? Number(
              (
                (babyCareCompleted.length / babyCareRegistered.length) *
                100
              ).toFixed(2),
            )
          : 0,
      babyCare,
    },

    leads: {
      entries: entries.filter((lead) => !isCoData(lead)),
      total_entries: entries.filter((lead) => !isCoData(lead)).length,
    },

    breakdown: {
      coData: {
        total: coDataLeads.length,
      },
      coEdu: {
        total: coEduLeads.length,
      },
      coLead: {
        total: coLeadLeads.length,
      },
      coSell: {
        total: coSellLeads.length,
      },
    },
  };
}
