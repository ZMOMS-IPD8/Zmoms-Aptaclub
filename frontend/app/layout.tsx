import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Đăng ký hội viên Zmoms",
  description: "Đăng ký hội viên và xác nhận đồng ý chia sẻ dữ liệu cá nhân",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
