import type { Metadata } from "next";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Stack } from "@/components/ui/stack";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShowcasePageHeader } from "@/features/showcase/components/showcase-page-header";
import { ShowcaseSection } from "@/features/showcase/components/showcase-section";

export const metadata: Metadata = {
  title: "Navigation",
};

export default function NavigationPage() {
  return (
    <>
      <ShowcasePageHeader
        title="Navigation"
        description="Tabs, breadcrumbs, and pagination. Every page header on this showcase also composes Breadcrumb with next/link through the render prop."
      />
      <ShowcaseSection
        title="Tabs"
        description="Default and line variants; keyboard navigation comes from the underlying primitive."
      >
        <Stack gap="lg">
          <Tabs defaultValue="first">
            <TabsList>
              <TabsTrigger value="first">First</TabsTrigger>
              <TabsTrigger value="second">Second</TabsTrigger>
              <TabsTrigger value="third" disabled>
                Disabled
              </TabsTrigger>
            </TabsList>
            <TabsContent value="first">
              <p>Filled list style. Arrow keys move between triggers.</p>
            </TabsContent>
            <TabsContent value="second">
              <p>Second panel.</p>
            </TabsContent>
          </Tabs>
          <Tabs defaultValue="first">
            <TabsList variant="line">
              <TabsTrigger value="first">First</TabsTrigger>
              <TabsTrigger value="second">Second</TabsTrigger>
            </TabsList>
            <TabsContent value="first">
              <p>Line variant with an underline indicator.</p>
            </TabsContent>
            <TabsContent value="second">
              <p>Second panel.</p>
            </TabsContent>
          </Tabs>
        </Stack>
      </ShowcaseSection>
      <ShowcaseSection
        title="Breadcrumb"
        description="With a collapsed middle segment and a framework link at the root."
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/showcase">Showcase</Link>} />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/showcase/navigation">Navigation</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </ShowcaseSection>
      <ShowcaseSection
        title="Pagination"
        description="Page math belongs to the consumer; the primitive renders the given items. Links here point back to this page."
      >
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="/showcase/navigation" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="/showcase/navigation">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="/showcase/navigation" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="/showcase/navigation">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="/showcase/navigation" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </ShowcaseSection>
    </>
  );
}
