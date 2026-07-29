"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useTranslations } from "@/core/providers/locale-provider";

export function PaginationDemo() {
  const t = useTranslations("pagination");

  return (
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
          <PaginationEllipsis label={t("ellipsisLabel")} />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="/showcase/navigation" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
