export default function PaymentGuide() {
  const steps = [
    {
      number: "01",
      title: "Quét mã QR",
      description: "Mở ứng dụng ngân hàng và quét mã QR chuyển khoản bên trên.",
    },
    {
      number: "02",
      title: "Kiểm tra thông tin",
      description:
        "Kiểm tra số tiền và nội dung chuyển khoản đã được điền sẵn.",
    },
    {
      number: "03",
      title: "Hoàn tất chuyển khoản",
      description: "Thực hiện chuyển khoản đúng số tiền và nội dung hiển thị.",
    },
    {
      number: "04",
      title: "Nhập thông tin nhận hàng",
      description:
        "Sau khi chuyển khoản, mẹ điền thông tin nhận hàng bên dưới.",
    },
  ];

  return (
    <section className="rounded-2xl border border-[#E5EAF0] bg-white p-5 sm:p-6">
      <h2 className="text-base font-extrabold text-[#12335B] sm:text-lg">
        HƯỚNG DẪN THANH TOÁN
      </h2>

      <div className="mt-5 space-y-4">
        {steps.map((step) => (
          <div key={step.number} className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#12335B] text-xs font-extrabold text-white">
              {step.number}
            </div>

            <div>
              <p className="text-sm font-bold text-[#12335B]">{step.title}</p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl bg-[#FFF5E3] px-4 py-3">
        <p className="text-xs leading-5 text-gray-600">
          <span className="font-bold text-[#E89512]">Lưu ý:</span> Mẹ vui lòng
          chuyển khoản đúng số tiền và giữ lại thông báo giao dịch thành công.
        </p>
      </div>
    </section>
  );
}
