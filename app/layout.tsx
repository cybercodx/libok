import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Hacker Forum",
  description: "A forum for security researchers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-mono antialiased">
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <div className="flex-1 container mx-auto py-6 px-4">{children}</div>
        </div>
      </body>
    </html>
  );
}
