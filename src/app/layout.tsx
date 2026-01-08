import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Math Puzzle - 수학 퍼즐 게임",
  description: "마틴 가드너의 클래식 수학 퍼즐을 인터랙티브 게임으로!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
