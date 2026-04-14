import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DailyBuy - 智能买菜规划助手",
  description: "根据家庭需求智能规划每周菜谱和采购清单",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
