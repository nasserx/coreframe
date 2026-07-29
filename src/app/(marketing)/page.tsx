import { MarketingFirstViewport } from "@/features/marketing/marketing-first-viewport";
import { NeutralPreview } from "@/features/marketing/neutral-preview";

export default function MarketingPage() {
  return <MarketingFirstViewport preview={<NeutralPreview />} />;
}
