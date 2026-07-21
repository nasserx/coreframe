import type { Metadata } from "next";

import { QueryDemo } from "@/features/showcase/components/query-demo";
import { ShowcasePageHeader } from "@/features/showcase/components/showcase-page-header";
import { ShowcaseSection } from "@/features/showcase/components/showcase-section";

export const metadata: Metadata = {
  title: "Data",
};

export default function DataPage() {
  return (
    <>
      <ShowcasePageHeader
        title="Data"
        description="React Query through the AppProvider's QueryProvider: a real fetch through the API boundary, skeleton loading, normalized error handling, and the foundation's caching defaults."
      />
      <ShowcaseSection
        title="Query with loading composition"
        description="The page itself stays a Server Component; only this demo island is client-side. It fetches from this app's own route handler through apiFetch (docs/DATA_LAYER.md)."
      >
        <QueryDemo />
      </ShowcaseSection>
    </>
  );
}
