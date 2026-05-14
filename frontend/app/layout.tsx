import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";
import ServerWakeupBanner from "@/components/ServerWakeupBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CokingCooding",
  description: "플래너, 파일 관리, 결제, 블로그를 하나의 플랫폼에서",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CokingCooding",
  },
  icons: {
    apple: "/main.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#030712",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* PWA/iOS Safari에서 viewport가 980px로 고정되는 경우 device-width로 강제 복원.
            screen.width<768이면 모바일 기기로 판단해 viewport meta를 없으면 생성, 있으면 덮어씀. */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{if(window.screen.width<768){var c='width=device-width,initial-scale=1,minimum-scale=1,viewport-fit=cover';var m=document.querySelector('meta[name="viewport"]');if(m){m.content=c;}else{m=document.createElement('meta');m.setAttribute('name','viewport');m.content=c;document.head.appendChild(m);}}}catch(e){}})()` }} />
      </head>
      <body className="min-h-full flex flex-col">
        <PwaRegister />
        <ServerWakeupBanner />
        {children}
      </body>
    </html>
  );
}
