export type Region = "north" | "south";

export type ClassSession = {
  id: string;
  region: Region;
  date: string;
  time: string;
  meetUrl: string;
};

export const CLASS_SESSIONS: ClassSession[] = [
  {
    id: "north-01",
    region: "north",
    date: "2026-10-30",
    time: "20:00",
    meetUrl: "https://meet.google.com/rsy-ceiu-eps",
  },
  {
    id: "south-01",
    region: "south",
    date: "2026-10-30",
    time: "20:00",
    meetUrl: "https://meet.google.com/rsy-ceiu-eps",
  },
];

const NORTH_PROVINCES = [
  "Hà Nội",
  "Hải Phòng",
  "Quảng Ninh",
  "Bắc Giang",
  "Bắc Ninh",
  "Hải Dương",
  "Hưng Yên",
  "Thái Bình",
  "Nam Định",
  "Hà Nam",
  "Ninh Bình",
  "Vĩnh Phúc",
  "Phú Thọ",
  "Thái Nguyên",
  "Bắc Kạn",
  "Cao Bằng",
  "Lạng Sơn",
  "Tuyên Quang",
  "Hà Giang",
  "Lào Cai",
  "Yên Bái",
  "Điện Biên",
  "Lai Châu",
  "Sơn La",
  "Hòa Bình",
  "Thanh Hóa",
  "Nghệ An",
  "Hà Tĩnh",
  "Quảng Bình",
  "Quảng Trị",
  "Thừa Thiên Huế",
];

export function getRegion(province: string): Region {
  const normalized = province.trim().toLowerCase();

  return NORTH_PROVINCES.some((item) => item.toLowerCase() === normalized)
    ? "north"
    : "south";
}

export function formatClassDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return value;
  }

  return `${match[3]}/${match[2]}/${match[1]}`;
}

export function formatClassDateTime(session: ClassSession) {
  return `${session.date} ${session.time}:00`;
}
