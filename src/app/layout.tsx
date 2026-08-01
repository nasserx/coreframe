import type { Metadata } from "next";
import { APP_CONFIG } from "@/config";
import { AppProvider } from "@/core/providers";
import { FONT_VARIABLE_CLASSES } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  // The full identity presentation — brand plus official descriptor
  // (src/config/app.ts). Segments that own a title, such as the showcase,
  // override this with their own template.
  title: `${APP_CONFIG.name} — ${APP_CONFIG.descriptor}`,
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
      className={`${FONT_VARIABLE_CLASSES} h-full`}
      // The theme init script sets the `dark` class before hydration.
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
