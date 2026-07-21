import type { Metadata } from "next";
import { CheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Stack } from "@/components/ui/stack";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_CONFIG } from "@/config";
import { ShowcasePageHeader } from "@/features/showcase/components/showcase-page-header";
import { ShowcaseSection } from "@/features/showcase/components/showcase-section";

export const metadata: Metadata = {
  title: "Direction",
};

const ARABIC_SAMPLE = "المعرفة أساس التقدم، والتصميم الجيد يخدم الجميع دون استثناء.";

const TYPE_RAMP = [
  { label: "text-display", className: "text-display" },
  { label: "text-title", className: "text-title" },
  { label: "text-heading", className: "text-heading" },
  { label: "text-subheading", className: "text-subheading" },
  { label: "text-body-lg", className: "text-body-lg" },
  { label: "text-body", className: "text-body" },
  { label: "text-small", className: "text-small" },
  { label: "text-caption", className: "text-caption" },
] as const;

const SAMPLE_NUMBER = 1234567.89;

const ARABIC_ROWS = [
  { id: "REC-001", label: "الطلب الأول", count: 12 },
  { id: "REC-002", label: "الطلب الثاني", count: 7 },
  { id: "REC-003", label: "الطلب الثالث", count: 31 },
] as const;

export default function DirectionPage() {
  const westernNumerals = new Intl.NumberFormat("ar-u-nu-latn").format(SAMPLE_NUMBER);
  const easternNumerals = new Intl.NumberFormat("ar-u-nu-arab").format(SAMPLE_NUMBER);

  return (
    <>
      <ShowcasePageHeader
        title="Direction & Arabic"
        description="Everything below is styled with logical properties only — the LTR/RTL control in the header flips the whole document, and the Arabic sections render right-to-left regardless. Architecture: docs/DIRECTION_AND_I18N.md."
      />
      <ShowcaseSection
        title="Arabic type ramp"
        description="Every ramp step with Arabic text. Under [dir=rtl] the token layer loosens line-height and zeroes letter-spacing — tracking breaks the connected script. Latin renders in Archivo; Arabic falls through the font stack to Noto Sans Arabic."
      >
        <div dir="rtl" lang="ar" className="flex flex-col rounded-lg border px-4">
          {TYPE_RAMP.map((step) => (
            <Stack key={step.label} gap="xs" className="border-b py-3 last:border-b-0">
              <code dir="ltr" className="self-start font-mono text-caption text-muted-foreground">
                {step.label}
              </code>
              <p className={step.className}>{ARABIC_SAMPLE}</p>
            </Stack>
          ))}
        </div>
      </ShowcaseSection>
      <ShowcaseSection
        title="Mixed content"
        description="Arabic prose with embedded Latin names and numerals. Each Latin run is wrapped in <bdi> so its internal order and adjacent punctuation cannot leak into the Arabic flow — the documented convention for opposite-direction runs (docs/DIRECTION_AND_I18N.md)."
      >
        <p dir="rtl" lang="ar" className="max-w-prose rounded-lg border p-4 text-body">
          أُطلق الإصدار 16 من إطار <bdi>Next.js</bdi> مع دعم كامل لخاصية{" "}
          <bdi>React Server Components</bdi>، وحقّق تحسّنًا في الأداء بنسبة 40٪ مقارنة بالإصدار
          السابق. تعتمد هذه المنصة على <bdi>TypeScript</bdi> و <bdi>Tailwind CSS</bdi>.
        </p>
      </ShowcaseSection>
      <ShowcaseSection
        title="Numerals"
        description={`Western (latn) is the foundation default — the prevailing convention in modern Arabic product UIs. A product switches to Eastern Arabic-Indic (arab) by changing one value in LOCALE_INFO (src/config/app.ts). Configured default: ${APP_CONFIG.numerals}.`}
      >
        <Stack gap="sm" className="max-w-form rounded-lg border p-4" dir="rtl" lang="ar">
          <div className="flex items-center justify-between gap-4">
            <code dir="ltr" className="font-mono text-caption text-muted-foreground">
              nu-latn (default)
            </code>
            <span className="text-body-lg">{westernNumerals}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <code dir="ltr" className="font-mono text-caption text-muted-foreground">
              nu-arab
            </code>
            <span className="text-body-lg">{easternNumerals}</span>
          </div>
        </Stack>
      </ShowcaseSection>
      <ShowcaseSection
        title="Primitives under RTL"
        description="The primitives most likely to break in RTL, rendered in a right-to-left Arabic island: table alignment, pagination chevrons (flipped via rtl:rotate-180), breadcrumb separators, dialog close placement, field error wiring, icon badges, and tabs."
      >
        <Stack gap="lg" dir="rtl" lang="ar">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المعرّف</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead className="text-end">العدد</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ARABIC_ROWS.map((row) => (
                <TableRow key={row.id}>
                  <TableCell dir="ltr" className="text-end font-mono text-xs">
                    {row.id}
                  </TableCell>
                  <TableCell>{row.label}</TableCell>
                  <TableCell className="text-end">{row.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex flex-wrap items-center gap-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/showcase">الرئيسية</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/showcase/direction">الإعدادات</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>الاتجاه</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <Badge variant="secondary">
              <CheckIcon data-icon="inline-start" aria-hidden="true" />
              مُفعّل
            </Badge>
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="/showcase/direction" text="السابق" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="/showcase/direction">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="/showcase/direction" isActive>
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="/showcase/direction" text="التالي" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <div className="flex flex-wrap items-start gap-8">
            <Dialog>
              <DialogTrigger render={<Button variant="outline" />}>فتح الحوار</DialogTrigger>
              <DialogContent dir="rtl" lang="ar">
                <DialogHeader>
                  <DialogTitle>تأكيد العملية</DialogTitle>
                  <DialogDescription>
                    زر الإغلاق يقع في نهاية السطر — إلى اليسار في الاتجاه من اليمين إلى اليسار.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter showCloseButton>
                  <Button>متابعة</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <div className="w-full max-w-form">
              <Field data-invalid="true">
                <FieldLabel htmlFor="rtl-invalid-example">اسم المستخدم</FieldLabel>
                <Input
                  id="rtl-invalid-example"
                  defaultValue="قيمة غير صالحة"
                  aria-invalid="true"
                  aria-describedby="rtl-invalid-example-error"
                />
                <FieldError id="rtl-invalid-example-error">
                  يجب أن يحتوي الاسم على أحرف وأرقام فقط.
                </FieldError>
              </Field>
            </div>
          </div>
          <Tabs defaultValue="first">
            <TabsList>
              <TabsTrigger value="first">النظرة العامة</TabsTrigger>
              <TabsTrigger value="second">التفاصيل</TabsTrigger>
            </TabsList>
            <TabsContent value="first">
              <p className="text-muted-foreground">
                تتنقل مفاتيح الأسهم بين التبويبات وفق اتجاه القراءة.
              </p>
            </TabsContent>
            <TabsContent value="second">
              <p className="text-muted-foreground">لوحة التفاصيل.</p>
            </TabsContent>
          </Tabs>
        </Stack>
      </ShowcaseSection>
    </>
  );
}
