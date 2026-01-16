import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://math-puzzle-alpha.vercel.app'),
  title: {
    template: '%s | 시후의 수학퍼즐',
    default: '시후의 수학퍼즐 - 창의력을 키우는 인터랙티브 수학 게임',
  },
  description: '주시후와 함께하는 재밌는 수학 퍼즐! 에라토스테네스의 체, 완전제곱수, 하노이의 탑 등 다양한 수학 원리를 게임으로 즐겨보세요.',
  keywords: ['시후의 수학퍼즐', '수학 게임', '어린이 수학', '수학 공부', '코딩 수학', '에라토스테네스의 체', '완전제곱수', '마틴 가드너'],
  authors: [{ name: 'Lee Junyeol', url: 'https://github.com/sangja21' }],
  openGraph: {
    title: '시후의 수학퍼즐',
    description: '수학이 이렇게 재밌었나요? 시후가 발견한 수학의 비밀들을 만나보세요!',
    type: 'website',
    locale: 'ko_KR',
    siteName: '시후의 수학퍼즐',
  },
  twitter: {
    card: 'summary_large_image',
    title: '시후의 수학퍼즐',
    description: '창의력을 키우는 인터랙티브 수학 퍼즐 게임',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: '36YdY1GSjrcQzbulXXRxVPxzhbsxLW_GxneotnQ5sxg',
  },
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
