import type {
  DashboardBabyCare,
  DashboardConsultation,
  DashboardOrder,
} from "../../app/dashboard/(app)/types/dashboard";

import {
  calculateConversion,
  countByDate,
  countByField,
  countByPeriod,
  getFunnelStats,
  getGroupedConversion,
  getPregnancySegmentation,
  getVietnamDateKey,
  getVietnamDateKeyFromValue,
} from "./metrics";

import {
  getFieldValue,
  getNumericValue,
  hasField,
  isCoData,
  isCoEdu,
  isCoLead,
  isCoSell,
  isDanoneConsent,
  isNU,
  isOrder,
  isPaidStatus,
} from "./logic";

type PancakeLead = Record<string, unknown>;

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

export function transformDashboardData(
  entries: PancakeLead[],
  totalEntries: number,
) {
  const coDataLeads = entries.filter(isCoData);
  const coEduLeads = coDataLeads.filter(isCoEdu);
  const coLeadLeads = coDataLeads.filter(isCoLead);
  const coSellLeads = coDataLeads.filter(isCoSell);
  const nuLeads = coDataLeads.filter(isNU);

  const todayKey = getVietnamDateKey();

  const todayCoDataLeads = coDataLeads.filter(
    (lead) => getVietnamDateKeyFromValue(lead.thoi_gian_dang_ky) === todayKey,
  );

  const todayRegistrationsByProvince = countByField(
    todayCoDataLeads,
    "thanh_pho",
  );

  const todayRegistrationsBySource = countByField(
    todayCoDataLeads,
    "nguon_dang_ky",
  );

  const orders = entries.filter(isOrder).map(formatOrder);

  const paidOrders = orders.filter((order) =>
    isPaidStatus(order.paymentStatus),
  );

  const deliveredOrders = orders.filter((order) => order.deliveredDate !== "");

  const revenue = paidOrders.reduce((total, order) => total + order.amount, 0);

  const consultations = coEduLeads.map(formatConsultation);

  const consultationRegistered = consultations.filter(
    (item) => item.registeredAt !== "",
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

  const ebookReceived = coDataLeads.filter((lead) =>
    hasField(lead, "email_nhan_ebook"),
  ).length;

  const consultationAttendanceRate =
    consultationRegistered.length > 0
      ? Number(
          (
            (consultationAttended.length / consultationRegistered.length) *
            100
          ).toFixed(2),
        )
      : 0;

  const babyCareCompletionRate =
    babyCareRegistered.length > 0
      ? Number(
          (
            (babyCareCompleted.length / babyCareRegistered.length) *
            100
          ).toFixed(2),
        )
      : 0;

  const leadEntries = entries.filter((lead) => !isCoData(lead));

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
        received: ebookReceived,
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
        today: {
          date: todayKey,
          total: todayCoDataLeads.length,
          byProvince: todayRegistrationsByProvince,
          bySource: todayRegistrationsBySource,
        },
        byDate: registrationsByDate,
        byProvince: registrationsByProvince,
        bySource: registrationsBySource,
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
      attendanceRate: consultationAttendanceRate,
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
      completionRate: babyCareCompletionRate,
      babyCare,
    },

    leads: {
      entries: leadEntries,
      total_entries: leadEntries.length,
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
      nu: {
        total: nuLeads.length,
      },
    },

    coSell: {
      total: coSellLeads.length,
      touchpoints: countByField(coSellLeads, "nguon_mua_hang"),
    },
  };
}
