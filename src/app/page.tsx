import { APP_CONFIG } from "@/config";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="text-2xl font-semibold text-foreground">{APP_CONFIG.name}</h1>
      <p className="text-muted-foreground">{APP_CONFIG.description}</p>
    </main>
  );
}
