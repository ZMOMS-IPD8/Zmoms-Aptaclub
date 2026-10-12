type Props = {
  registered?: boolean;
  purchased?: boolean;
  purchasedWithoutRegistration?: boolean;
  orderingMode: boolean;
  ordered: boolean;
  onStartOrder: () => void;
};

function StatusBadge({
  value,
  trueLabel,
  falseLabel,
}: {
  value: boolean | undefined;
  trueLabel: string;
  falseLabel: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-bold ${
        value === true
          ? "bg-[#E8F8FD] text-[#1188B4]"
          : "bg-red-50 text-red-600"
      }`}
    >
      {value === true ? trueLabel : falseLabel}
    </span>
  );
}

export default function OrderCheckResult({
  registered,
  purchased,
  purchasedWithoutRegistration,
  orderingMode,
  ordered,
  onStartOrder,
}: Props) {
  const canOrder =
    registered === true &&
    purchased !== true &&
    purchasedWithoutRegistration !== true;

  return (
    <section
      aria-label="Kết quả kiểm tra thông tin khách hàng"
      className="space-y-3 rounded-2xl border border-[#E5EBF2] bg-[#F8FBFD] p-4"
    >
      <h3 className="text-sm font-bold text-[#12335B]">Kết quả kiểm tra</h3>

      <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E3EAF0] bg-white px-3 py-3">
        <span className="text-sm font-medium text-[#12335B]">
          Đăng ký hội viên
        </span>

        <StatusBadge
          value={registered}
          trueLabel="Đã đăng ký"
          falseLabel="Chưa đăng ký"
        />
      </div>

      <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E3EAF0] bg-white px-3 py-3">
        <span className="text-sm font-medium text-[#12335B]">
          Tình trạng mua hàng
        </span>

        <StatusBadge
          value={purchased}
          trueLabel="Đã mua hàng"
          falseLabel="Chưa mua hàng"
        />
      </div>

      {purchased === true && (
        <p
          role="status"
          className="rounded-xl bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-700"
        >
          Khách hàng đã mua hàng. Không thể lên đơn mới cho số điện thoại này.
        </p>
      )}

      {purchasedWithoutRegistration === true && (
        <p
          role="status"
          className="rounded-xl bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-700"
        >
          Khách hàng đã mua hàng nhưng chưa đăng ký hội viên. Vui lòng hướng dẫn
          khách đăng ký theo quy trình hiện tại.
        </p>
      )}

      {registered === false &&
        purchased !== true &&
        purchasedWithoutRegistration !== true && (
          <p className="rounded-xl bg-gray-100 px-4 py-3 text-sm leading-5 text-gray-600">
            Chưa tìm thấy thông tin đăng ký hội viên của số điện thoại này. Vui
            lòng kiểm tra lại thông tin hoặc hướng dẫn khách đăng ký.
          </p>
        )}

      {canOrder && !orderingMode && !ordered && (
        <button
          type="button"
          onClick={onStartOrder}
          className="h-12 w-full rounded-xl bg-[#18A8DC] text-sm font-bold text-white transition hover:bg-[#1099CB] focus:outline-none focus:ring-4 focus:ring-[#18A8DC]/20"
        >
          Tiếp tục lên đơn
        </button>
      )}
    </section>
  );
}
