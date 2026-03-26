import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskOrbits",
  description: "AI-powered task management and automation platform to boost your productivity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
