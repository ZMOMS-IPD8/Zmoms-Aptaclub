export function generateOrderCode() {
  const now = new Date();

  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .replace(/-/g, "");

  const random = Math.floor(100000 + Math.random() * 900000);

  return `ZM${date}${random}`;
}
