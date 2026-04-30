import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";

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
        {/* iOS Safari "Request Desktop Website" 설정이 켜져 있으면 viewport를 980px로 강제하는데,
            실제 screen.width가 768px 미만이면 device-width로 복원한다. */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{if(window.screen.width<768&&window.innerWidth>500){var m=document.querySelector('meta[name="viewport"]');if(m)m.content='width=device-width,initial-scale=1,minimum-scale=1,viewport-fit=cover';}}catch(e){}})()` }} />
      </head>
      <body className="min-h-full flex flex-col">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
