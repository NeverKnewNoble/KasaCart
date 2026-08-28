import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import AuthSessionProvider from "@/components/providers/SessionProvider";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const body = Hanken_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KasaCart",
  description:
    "KasaCart gives social sellers a storefront customers order from, plus one dashboard to track and fulfil every order. Sell on WhatsApp, Instagram and TikTok without losing track.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthSessionProvider>
          <QueryProvider> { children } </QueryProvider>
        </AuthSessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
