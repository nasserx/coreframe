import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { APP_CONFIG } from "@/config";
import { AppProvider } from "@/core/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_CONFIG.name,
  description: APP_CONFIG.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={APP_CONFIG.defaultLocale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // The theme init script sets the `dark` class before hydration.
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
