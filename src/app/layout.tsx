import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
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

/*
 * Arabic companion face. Geist has no Arabic glyphs, so the sans stack in
 * src/styles/theme.css lists this after Geist: Latin renders in Geist,
 * Arabic falls through to Noto Sans Arabic. next/font self-hosts and
 * preloads with metric-adjusted fallbacks — no render blocking, no layout
 * shift. Arabic vertical-metric compensation lives in the type ramp's
 * [dir="rtl"] overrides (src/styles/theme.css), not here.
 */
const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-sans-arabic",
  subsets: ["arabic"],
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
      // Direction is static per deployment, derived from the default locale
      // (docs/DIRECTION_AND_I18N.md). All styling is logical-property based,
      // so this attribute is the only direction switch.
      dir={APP_CONFIG.direction}
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansArabic.variable} h-full antialiased`}
      // The theme init script sets the `dark` class before hydration.
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
