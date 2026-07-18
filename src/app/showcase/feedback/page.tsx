import type { Metadata } from "next";
import { InboxIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Stack } from "@/components/ui/stack";
import { Spinner } from "@/components/ui/spinner";
import { ErrorBoundaryDemo } from "@/features/showcase/components/error-boundary-demo";
import { ShowcasePageHeader } from "@/features/showcase/components/showcase-page-header";
import { ShowcaseSection } from "@/features/showcase/components/showcase-section";

export const metadata: Metadata = {
  title: "Feedback",
};

export default function FeedbackPage() {
  return (
    <>
      <ShowcasePageHeader
        title="Feedback"
        description="Loading, empty, and error states — all composed from primitives at the call site. None of these are dedicated components, by design."
      />
      <ShowcaseSection
        title="Skeleton composition"
        description="A pending card mirrors the shape of the loaded card so the layout never jumps."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Card size="sm" aria-busy="true">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium">Loaded content</p>
                  <p className="text-xs text-muted-foreground">The real shape</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The skeleton on the left reserves exactly this footprint.
              </p>
            </CardContent>
          </Card>
        </div>
      </ShowcaseSection>
      <ShowcaseSection title="Spinner" description="Inherits currentColor; sized via className.">
        <div className="flex items-center gap-6">
          <Spinner />
          <Spinner className="size-6" />
          <Spinner className="size-8 text-muted-foreground" />
          <Separator orientation="vertical" className="h-8" />
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner aria-hidden="true" />
            Inline with text
          </span>
        </div>
      </ShowcaseSection>
      <ShowcaseSection
        title="Empty state"
        description="Composed from Card, an icon, and a Button — no EmptyState primitive exists, and this is the pattern features should copy."
      >
        <Card className="max-w-form">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <InboxIcon className="size-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <Stack gap="xs">
              <p className="text-sm font-medium">Nothing here yet</p>
              <p className="text-sm text-muted-foreground">
                Entries appear here once they are created.
              </p>
            </Stack>
            <Button size="sm" variant="outline">
              Create the first entry
            </Button>
          </CardContent>
        </Card>
      </ShowcaseSection>
      <ShowcaseSection
        title="Error boundary"
        description="The core ErrorBoundary with a region-level fallback built from primitives, passed in from the feature layer."
      >
        <ErrorBoundaryDemo />
      </ShowcaseSection>
    </>
  );
}
