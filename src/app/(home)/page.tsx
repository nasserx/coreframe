import { APP_CONFIG } from "@/config";
import { BrandMark } from "@/components/ui/brand-mark";

// The `<main>` landmark is owned by the segment layout, not the page
// (docs/LAYOUT.md § The main landmark). Hero composition: the copy block
// holds the first viewport with generous breathing room — the flat
// identity leads with typography, not decoration.
export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-24 text-center">
      <BrandMark className="size-12" />
      <h1 className="max-w-prose text-title sm:text-display">{APP_CONFIG.name}</h1>
      <p className="max-w-prose text-body-lg">{APP_CONFIG.description}</p>
    </div>
  );
}
