import type { Metadata } from "next";

import { getTranslations } from "@/i18n";
import { SiteShowcaseContent } from "@/features/showcase/components/site-showcase-content";

// Server Component wrapper: it owns the static metadata (rendered in the
// build-time default locale — page metadata is a build-time concern, so it does
// not follow a client locale switch, a documented limitation of the
// client-side locale runtime) and delegates the translatable, switch-reactive
// body to a client component.
export const metadata: Metadata = {
  title: getTranslations("site")("metaTitle"),
};

export default function SitePage() {
  return <SiteShowcaseContent />;
}
