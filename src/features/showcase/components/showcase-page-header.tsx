import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PageHeader, PageHeaderDescription, PageHeaderTitle } from "@/components/ui/page-header";

type ShowcasePageHeaderProps = Readonly<{
  title: string;
  description: string;
}>;

/**
 * Feature binding over the shared PageHeader primitive: supplies the
 * showcase's breadcrumb root and the dir="auto" inspection behavior.
 * Structure, rhythm, and measure live in the primitive.
 */
export function ShowcasePageHeader({ title, description }: ShowcasePageHeaderProps) {
  return (
    <PageHeader>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/showcase">Showcase</Link>} />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeaderTitle>{title}</PageHeaderTitle>
      {/* dir="auto": see docs/DIRECTION_AND_I18N.md — bidi isolation. */}
      <PageHeaderDescription dir="auto">{description}</PageHeaderDescription>
    </PageHeader>
  );
}
