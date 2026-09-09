import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ưu Đãi Hội viên Zmoms",
  description: "Đăng ký hội viên và xác nhận đồng ý chia sẻ dữ liệu cá nhân",
  icons: {
    icon: "/logo-zmoms.png",
    shortcut: "/logo-zmoms.png",
    apple: "/logo-zmoms.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        {children}
        <Footer />
      </body>
    </html>
  );
}
