import { APP_CONFIG } from "@/config";

// The `<main>` landmark is owned by the segment layout, not the page
// (docs/LAYOUT.md § The main landmark).
export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="text-2xl font-semibold text-foreground">{APP_CONFIG.name}</h1>
      <p className="text-muted-foreground">{APP_CONFIG.description}</p>
    </div>
  );
}
