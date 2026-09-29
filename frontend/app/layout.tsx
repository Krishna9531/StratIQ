import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "StratIQ | Enterprise Decision Intelligence",
  description: "Enterprise Decision Intelligence & Risk Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans h-screen flex overflow-hidden antialiased bg-background text-primary-text`}>
        {children}
      </body>
    </html>
  );
}
