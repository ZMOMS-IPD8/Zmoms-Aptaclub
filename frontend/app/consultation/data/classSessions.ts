export type Region = "north" | "south";

export type ClassSession = {
  id: string;
  region: Region;
  title: string;
  date: string;
  time: string;
  meetUrl: string;
};

export const CLASS_SESSIONS: ClassSession[] = [
  {
    id: "north-01",
    region: "north",
    title: "Lớp học cùng Nữ hộ sinh",
    date: "2026-09-07",
    time: "20:00",
    meetUrl: "https://meet.google.com/xxx-xxxx-xxx",
  },
  {
    id: "north-02",
    region: "north",
    title: "Lớp học cùng Nữ hộ sinh",
    date: "2026-09-14",
    time: "20:00",
    meetUrl: "https://meet.google.com/yyy-yyyy-yyy",
  },
  {
    id: "north-03",
    region: "north",
    title: "Lớp học cùng Nữ hộ sinh",
    date: "2026-09-21",
    time: "20:00",
    meetUrl: "https://meet.google.com/bnb-zqxx-vtf",
  },
  {
    id: "north-04",
    region: "north",
    title: "Lớp học cùng Nữ hộ sinh",
    date: "2026-09-28",
    time: "20:00",
    meetUrl: "https://meet.google.com/bnb-zqxx-vtf",
  },
  {
    id: "south-01",
    region: "south",
    title: "Lớp học cùng Nữ hộ sinh",
    date: "2026-09-09",
    time: "20:00",
    meetUrl: "https://meet.google.com/xxx-xxxx-xxx",
  },
  {
    id: "south-02",
    region: "south",
    title: "Lớp học cùng Nữ hộ sinh",
    date: "2026-09-16",
    time: "20:00",
    meetUrl: "https://meet.google.com/yyy-yyyy-yyy",
  },
  {
    id: "south-03",
    region: "south",
    title: "Lớp học cùng Nữ hộ sinh",
    date: "2026-09-23",
    time: "20:00",
    meetUrl: "https://meet.google.com/bnb-zqxx-vtf",
  },
  {
    id: "south-04",
    region: "south",
    title: "Lớp học cùng Nữ hộ sinh",
    date: "2026-09-30",
    time: "20:00",
    meetUrl: "https://meet.google.com/bnb-zqxx-vtf",
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

  if (!match) return value;

  return `${match[3]}/${match[2]}/${match[1]}`;
}

export function formatClassDateTime(session: ClassSession) {
  return `${session.date} ${session.time}:00`;
}
