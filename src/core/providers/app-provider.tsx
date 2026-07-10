import type { ReactNode } from "react";

type AppProviderProps = Readonly<{
  children: ReactNode;
}>;

export function AppProvider({ children }: AppProviderProps) {
  // TODO: Add Theme provider.
  // TODO: Add React Query provider.
  // TODO: Add Toast provider.
  // TODO: Add Error Boundary provider.
  // TODO: Add Authentication provider.
  // TODO: Add Localization provider.
  return children;
}
