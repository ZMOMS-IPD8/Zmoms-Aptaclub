"use client";

import { useState } from "react";
import type { Member } from "../page";
import type { ClassSession } from "../data/classSessions";

type Props = {
  member: Member;
  selectedClass: ClassSession;
  onComplete: () => void;
  onSkip: () => void;
};

export default function PreSurvey({
  member,
  selectedClass,
  onComplete,
  onSkip,
}: Props) {
  const [thuTuCon, setThuTuCon] = useState("");
  const [duKienSinh, setDuKienSinh] = useState("");

  const [ncbsmeSanSang, setNcbsmeSanSang] = useState("");
  const [ncbsmeKienThuc, setNcbsmeKienThuc] = useState("");
  const [ncbsmePhuongAn, setNcbsmePhuongAn] = useState("");

  const [sinhMoThieuSua, setSinhMoThieuSua] = useState("");
  const [sinhMoThuocGiamDau, setSinhMoThuocGiamDau] = useState("");
  const [sinhMoPhuongAn, setSinhMoPhuongAn] = useState("");

  const [khoangCachCon, setKhoangCachCon] = useState("");
  const [thoiGianNcbsme, setThoiGianNcbsme] = useState("");
  const [phuongPhapNuoiCon, setPhuongPhapNuoiCon] = useState("");
  const [kinhNghiemSinhMo, setKinhNghiemSinhMo] = useState("");

  const [nhuCauHoTro, setNhuCauHoTro] = useState("");
  const [uuTienPhatTrien, setUuTienPhatTrien] = useState("");
  const [thuongHieu, setThuongHieu] = useState("");
  const [kyVong, setKyVong] = useState("");
  const [nhanBietIpd8, setNhanBietIpd8] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isFirstBaby = thuTuCon === "Con đầu lòng";
  const isSecondBaby = thuTuCon === "Con thứ 2";
  const isCesarean = duKienSinh === "Sinh mổ";
  const isNaturalBirth = duKienSinh === "Sinh thường";

  const handleSubmit = async () => {
    setError("");

    if (!thuTuCon || !duKienSinh) {
      setError("Mẹ vui lòng hoàn thành các thông tin cơ bản.");
      return;
    }

    if (!nhuCauHoTro || !uuTienPhatTrien) {
      setError("Mẹ vui lòng hoàn thành phần nhu cầu chung.");
      return;
    }

    setLoading(true);

    const survey = {
      submittedAt: new Date().toISOString(),

      member: {
        name: member.name,
        phone: member.phone,
        leadId: member.leadId,
      },

      booking: {
        classId: selectedClass.id,
        classTitle:
          'Buổi tư vấn online: "CÁCH XỬ TRÍ CÁC TÌNH HUỐNG THƯỜNG GẶP KHI NUÔI CON BẰNG SỮA MẸ"',
        date: selectedClass.date,
        time: selectedClass.time,
      },

      thongTinChung: {
        thuTuCon,
        duKienSinh,
      },

      conDauLong: isFirstBaby
        ? {
            sinhThuong: isNaturalBirth
              ? {
                  ncbsmeSanSang,
                  ncbsmeKienThuc,
                  ncbsmePhuongAn,
                }
              : null,

            sinhMo: isCesarean
              ? {
                  thieuSua: sinhMoThieuSua,
                  thuocGiamDau: sinhMoThuocGiamDau,
                  phuongAn: sinhMoPhuongAn,
                }
              : null,
          }
        : null,

      conThuHai: isSecondBaby
        ? {
            khoangCachCon,
            thoiGianNcbsme,
            phuongPhapNuoiCon,
            kinhNghiemSinhMo,
          }
        : null,

      nhuCau: {
        nhuCauHoTro,
        uuTienPhatTrien,
        thuongHieu,
        kyVong,
        nhanBietIpd8,
      },
    };

    try {
      const response = await fetch("/api/pre-survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId: member.leadId,
          survey,
        }),
      });

      const data = await response.json();

      if (response.status === 409) {
        setError(
          data?.message || "Mẹ đã hoàn thành khảo sát trước buổi học trước đó.",
        );
        return;
      }

      if (!response.ok) {
        setError(
          data?.message || "Không thể lưu khảo sát. Mẹ vui lòng thử lại.",
        );
        return;
      }

      onComplete();
    } catch {
      setError("Không thể gửi khảo sát lúc này. Mẹ vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
      <p className="text-xs font-bold uppercase tracking-wide text-[#18A8DC]">
        Khảo sát trước buổi tư vấn
      </p>

      <h2 className="mt-1 text-xl font-extrabold text-[#12335B]">
        Mẹ chia sẻ một chút trước buổi học
      </h2>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        Thông tin này giúp Nữ hộ sinh hiểu hơn về tình trạng và nhu cầu của mẹ
        trước khi tư vấn.
      </p>

      <div className="mt-6 space-y-6">
        <RadioGroup
          label="Mẹ đang mang thai con thứ mấy?"
          value={thuTuCon}
          options={["Con đầu lòng", "Con thứ 2"]}
          onChange={setThuTuCon}
        />

        <RadioGroup
          label="Mẹ đã có dự kiến sẽ sinh thường hay sinh mổ chưa?"
          value={duKienSinh}
          options={["Sinh thường", "Sinh mổ"]}
          onChange={setDuKienSinh}
        />

        {isFirstBaby && isNaturalBirth && (
          <div className="space-y-5 rounded-2xl bg-[#F5F9FC] p-4">
            <p className="text-sm font-bold text-[#12335B]">
              Con đầu lòng – Sinh thường
            </p>

            <RadioGroup
              label="Mẹ đã sẵn sàng cho việc Nuôi con bằng sữa mẹ chưa?"
              value={ncbsmeSanSang}
              options={["Có", "Không"]}
              onChange={setNcbsmeSanSang}
            />

            <RadioGroup
              label="Mẹ đã chuẩn bị đầy đủ kiến thức xử trí các tình huống khi Nuôi con bằng sữa mẹ chưa?"
              value={ncbsmeKienThuc}
              options={["Có", "Không"]}
              onChange={setNcbsmeKienThuc}
            />

            <RadioGroup
              label="Mẹ đã có phương án xử lý khi gặp khó khăn chưa?"
              value={ncbsmePhuongAn}
              options={["Có", "Không"]}
              onChange={setNcbsmePhuongAn}
            />
          </div>
        )}

        {isFirstBaby && isCesarean && (
          <div className="space-y-5 rounded-2xl bg-[#F5F9FC] p-4">
            <p className="text-sm font-bold text-[#12335B]">
              Con đầu lòng – Sinh mổ
            </p>

            <RadioGroup
              label="Mẹ có biết sinh mổ có thể không đủ sữa / khó về sữa không?"
              value={sinhMoThieuSua}
              options={["Có", "Không"]}
              onChange={setSinhMoThieuSua}
            />

            <RadioGroup
              label="Mẹ có biết thuốc giảm đau có thể ảnh hưởng đến lượng sữa không?"
              value={sinhMoThuocGiamDau}
              options={["Có", "Không"]}
              onChange={setSinhMoThuocGiamDau}
            />

            <RadioGroup
              label="Mẹ đã có phương án xử lý cho tình huống trên chưa?"
              value={sinhMoPhuongAn}
              options={["Có", "Không"]}
              onChange={setSinhMoPhuongAn}
            />
          </div>
        )}

        {isSecondBaby && (
          <div className="space-y-5 rounded-2xl bg-[#F5F9FC] p-4">
            <p className="text-sm font-bold text-[#12335B]">Con thứ 2</p>

            <TextInput
              label="Đứa trước cách đứa thứ 2 bao nhiêu tháng/tuổi?"
              value={khoangCachCon}
              onChange={setKhoangCachCon}
              placeholder="Ví dụ: 3 tuổi"
            />

            <TextInput
              label="Với đứa trước, mẹ đã Nuôi con bằng sữa mẹ trong bao lâu?"
              value={thoiGianNcbsme}
              onChange={setThoiGianNcbsme}
              placeholder="Ví dụ: 18 tháng"
            />

            <TextInput
              label="Đối với đứa con thứ 2, mẹ nghĩ sẽ áp dụng phương pháp nuôi con nào?"
              value={phuongPhapNuoiCon}
              onChange={setPhuongPhapNuoiCon}
              placeholder="Mẹ nhập câu trả lời"
            />

            {isCesarean && (
              <TextInput
                label="Mẹ đã có kinh nghiệm xử lý cho tình huống sinh mổ ảnh hưởng đến lượng sữa chưa?"
                value={kinhNghiemSinhMo}
                onChange={setKinhNghiemSinhMo}
                placeholder="Mẹ nhập câu trả lời"
              />
            )}
          </div>
        )}

        <RadioGroup
          label="Mẹ có cần hỗ trợ bổ sung trong lúc Nuôi con bằng sữa mẹ không?"
          value={nhuCauHoTro}
          options={["Có", "Không"]}
          onChange={setNhuCauHoTro}
        />

        <RadioGroup
          label="Mẹ ưu tiên yếu tố nào cho bé?"
          value={uuTienPhatTrien}
          options={[
            "Chiều cao",
            "Cân nặng",
            "Miễn dịch",
            "Đường ruột",
            "Trí não",
          ]}
          onChange={setUuTienPhatTrien}
        />

        <TextInput
          label="Trong trường hợp sử dụng thực phẩm bổ sung, mẹ nghĩ đến thương hiệu nào? Vì sao?"
          value={thuongHieu}
          onChange={setThuongHieu}
          placeholder="Mẹ nhập câu trả lời"
          multiline
        />

        <TextInput
          label="Mẹ mong đợi được giải đáp gì trong buổi tư vấn này?"
          value={kyVong}
          onChange={setKyVong}
          placeholder="Mẹ nhập câu trả lời"
          multiline
        />

        <RadioGroup
          label="Mẹ biết về IPD8 qua đâu?"
          value={nhanBietIpd8}
          options={[
            "IPD8 là Trung tâm cung cấp giải pháp nuôi con trong 1000 ngày vàng đầu đời",
            "IPD8 là Trung tâm tổ chức Ngày hội 1000 ngày vàng đầu đời",
            "Chưa biết gì về IPD8",
          ]}
          onChange={setNhanBietIpd8}
        />
      </div>

      {error && (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="mt-6 h-12 w-full rounded-xl bg-[#12335B] text-sm font-bold text-white hover:bg-[#0D2949] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "ĐANG GỬI..." : "HOÀN TẤT KHẢO SÁT"}
      </button>

      <button
        type="button"
        onClick={onSkip}
        disabled={loading}
        className="mt-3 h-10 w-full text-sm font-bold text-gray-500 hover:text-[#12335B]"
      >
        Bỏ qua khảo sát
      </button>
    </section>
  );
}

function RadioGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold leading-6 text-[#12335B]">{label}</p>

      <div className="mt-3 space-y-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#D8E1EB] p-3 hover:border-[#18A8DC]"
          >
            <input
              type="radio"
              name={label}
              value={option}
              checked={value === option}
              onChange={(e) => onChange(e.target.value)}
              className="mt-1"
            />

            <span className="text-sm leading-5 text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-semibold leading-6 text-[#12335B]">
        {label}
      </label>

      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="mt-3 w-full rounded-xl border border-[#D8E1EB] px-4 py-3 text-sm text-[#12335B] outline-none placeholder:text-gray-400 focus:border-[#18A8DC] focus:ring-2 focus:ring-[#18A8DC]/10"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-3 h-12 w-full rounded-xl border border-[#D8E1EB] px-4 py-3 text-sm text-[#12335B] outline-none placeholder:text-gray-400 focus:border-[#18A8DC] focus:ring-2 focus:ring-[#18A8DC]/10"
        />
      )}
    </div>
  );
}
