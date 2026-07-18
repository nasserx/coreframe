import { cn } from "@/lib/utils";

type TokenSwatchProps = Readonly<{
  name: string;
  swatchClassName: string;
}>;

export function TokenSwatch({ name, swatchClassName }: TokenSwatchProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <span
        aria-hidden="true"
        className={cn("size-8 shrink-0 rounded-md border", swatchClassName)}
      />
      <code className="font-mono text-xs">{name}</code>
    </div>
  );
}
