import { Inter } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import ClientLayout from "./components/ClientLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Denizlispor Menajerlik",
  description:
    "Stratejik kararlar alarak kulübü finansal zorluklar karşısında yönetin.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={inter.className}>
      <ClientLayout>{children}</ClientLayout>
    </html>
  );
}
