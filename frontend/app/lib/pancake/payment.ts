type PaymentData = {
  bill_phone_number?: string;
  bill_full_name?: string;
  cod?: number;
  payment_note?: string;
  is_payment_success?: boolean;
  bank_accounts?: Array<{
    access_key?: string;
    partner_code?: string;
    secret_key?: string;
    is_tcb?: boolean;
  }>;
};

export type PancakePaymentInfo = {
  paymentId: string;
  paymentUrl: string;
  bankCode: string;
  bankName: string;
  partnerCode: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  paymentNote: string;
  transferContent: string;
  isPaymentSuccess: boolean;
};

function getNextData(html: string) {
  const match = html.match(
    /<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i,
  );

  if (!match) {
    throw new Error("Không tìm thấy dữ liệu thanh toán.");
  }

  try {
    return JSON.parse(match[1]);
  } catch {
    throw new Error("Không thể đọc dữ liệu thanh toán.");
  }
}

function getMetaValue(html: string, id: string) {
  const match = html.match(
    new RegExp(`<[^>]+id=["']${id}["'][^>]*data=["']([^"']*)["'][^>]*>`, "i"),
  );

  return match?.[1]?.trim() ?? "";
}

function getMetaBankName(html: string) {
  const match = html.match(
    /<[^>]+id=["']bank_code["'][^>]*data=["'][^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/i,
  );

  if (!match) {
    return "";
  }

  return match[1]
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function replacePaymentNote(template: string, phone: string, fullName: string) {
  return template
    .replaceAll("{BILL_PHONE_NUMBER}", phone)
    .replaceAll("{BILL_FULL_NAME}", fullName)
    .trim();
}

export async function getPancakePaymentInfo(
  trackingLink: string,
): Promise<PancakePaymentInfo> {
  if (!trackingLink) {
    throw new Error("Không tìm thấy tracking link của đơn hàng.");
  }

  const trackingUrl = new URL(trackingLink);
  const paymentId = trackingUrl.searchParams.get("id");

  if (!paymentId) {
    throw new Error("Không tìm thấy payment ID.");
  }

  const paymentUrl =
    `https://order.pke.gg/payment?id=` + encodeURIComponent(paymentId);

  const response = await fetch(paymentUrl, {
    method: "GET",
    headers: {
      Accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Không thể lấy thông tin thanh toán. HTTP ${response.status}.`,
    );
  }

  const html = await response.text();

  const nextData = getNextData(html);

  const data = nextData?.props?.pageProps?.data as PaymentData | undefined;

  if (!data) {
    throw new Error("Không tìm thấy dữ liệu thanh toán.");
  }

  const bankAccount = data.bank_accounts?.[0];

  if (!bankAccount) {
    throw new Error("Đơn hàng chưa có tài khoản ngân hàng nhận tiền.");
  }

  const bankCode = getMetaValue(html, "bank_code");
  const bankName = getMetaBankName(html);

  const accountNumberFromHtml = getMetaValue(html, "bank_account");
  const amountFromHtml = getMetaValue(html, "amount");

  const phone = String(data.bill_phone_number ?? "")
    .trim()
    .replace(/\D/g, "");

  const fullName = String(data.bill_full_name ?? "").trim();

  const paymentNote = String(data.payment_note ?? "").trim();

  const transferContent = replacePaymentNote(paymentNote, phone, fullName);

  const amount = Number(amountFromHtml || data.cod || 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Số tiền thanh toán không hợp lệ.");
  }

  const accountNumber = String(
    accountNumberFromHtml || bankAccount.secret_key || "",
  ).trim();

  const accountName = String(bankAccount.access_key ?? "").trim();

  const partnerCode = String(bankAccount.partner_code ?? "").trim();

  if (!accountNumber) {
    throw new Error("Không tìm thấy số tài khoản nhận tiền.");
  }

  if (!accountName) {
    throw new Error("Không tìm thấy tên tài khoản nhận tiền.");
  }

  if (!bankCode) {
    throw new Error("Không tìm thấy mã ngân hàng nhận tiền.");
  }

  if (!bankName) {
    throw new Error("Không tìm thấy tên ngân hàng nhận tiền.");
  }

  if (!transferContent) {
    throw new Error("Không tìm thấy nội dung chuyển khoản.");
  }

  return {
    paymentId,
    paymentUrl,
    bankCode,
    bankName,
    partnerCode,
    accountNumber,
    accountName,
    amount,
    paymentNote,
    transferContent,
    isPaymentSuccess: Boolean(data.is_payment_success),
  };
}
