import type { Metadata } from "next";
import { EB_Garamond, Geist } from "next/font/google";
import "./globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "UndanganJo | Undangan Digital Premium", template: "%s | UndanganJo" },
  description:
    "Buat undangan pernikahan digital yang terasa personal. Self-serve atau dibantu tim kami via WhatsApp.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${ebGaramond.variable} ${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
