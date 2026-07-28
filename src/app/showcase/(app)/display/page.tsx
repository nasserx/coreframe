import type { Metadata } from "next";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Stack } from "@/components/ui/stack";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShowcasePageHeader } from "@/features/showcase/components/showcase-page-header";
import { ShowcaseSection } from "@/features/showcase/components/showcase-section";

export const metadata: Metadata = {
  title: "Display",
};

const TABLE_ROWS = [
  { id: "REC-001", label: "First entry", count: 12 },
  { id: "REC-002", label: "Second entry", count: 7 },
  { id: "REC-003", label: "Third entry", count: 31 },
] as const;

export default function DisplayPage() {
  return (
    <>
      <ShowcasePageHeader
        title="Display"
        description="Surfaces and data presentation: Card slot composition, native tables, avatar clusters, separators, and designed scroll surfaces."
      />
      <ShowcaseSection
        title="Card composition"
        description="Header, action, content, and footer slots coordinating through data-slot selectors."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Default card</CardTitle>
              <CardDescription>A surface with header, content, and footer.</CardDescription>
              <CardAction>
                <Badge variant="secondary">slot</Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <p>
                The footer below picks up its divider and background from the card footer slot — no
                per-use styling.
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button size="sm">Confirm</Button>
              <Button size="sm" variant="ghost">
                Dismiss
              </Button>
            </CardFooter>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>Small card</CardTitle>
              <CardDescription>
                The sm size tightens spacing through one CSS variable.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AspectRatio
                ratio={16 / 9}
                className="flex items-center justify-center rounded-lg border bg-muted"
              >
                <code className="font-mono text-xs text-muted-foreground">AspectRatio 16 / 9</code>
              </AspectRatio>
            </CardContent>
          </Card>
        </div>
      </ShowcaseSection>
      <ShowcaseSection title="Table">
        <Table>
          <TableCaption>Static demonstration data.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Label</TableHead>
              <TableHead className="text-end">Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TABLE_ROWS.map((row, index) => (
              <TableRow key={row.id} data-state={index === 1 ? "selected" : undefined}>
                <TableCell className="font-mono text-xs">{row.id}</TableCell>
                <TableCell>{row.label}</TableCell>
                <TableCell className="text-end">{row.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="text-end">50</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </ShowcaseSection>
      <ShowcaseSection
        title="Avatars"
        description="Fallback initials only — the showcase ships no image assets."
      >
        <div className="flex items-center gap-6">
          <Avatar size="sm">
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>CD</AvatarFallback>
            <AvatarBadge aria-hidden="true" />
          </Avatar>
          <Avatar size="lg">
            <AvatarFallback>EF</AvatarFallback>
          </Avatar>
          <Separator orientation="vertical" className="h-8" />
          <AvatarGroup>
            <Avatar>
              <AvatarFallback>GH</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>IJ</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>KL</AvatarFallback>
            </Avatar>
            <AvatarGroupCount>+3</AvatarGroupCount>
          </AvatarGroup>
        </div>
      </ShowcaseSection>
      <ShowcaseSection
        title="Scroll area"
        description="A designed scroll surface with themed overlay scrollbars — distinct from Table's plain overflow container."
      >
        <ScrollArea className="h-40 max-w-form rounded-lg border">
          <Stack gap="xs" className="p-3">
            {Array.from({ length: 20 }, (_, index) => (
              <p key={index} className="rounded-md px-2 py-1 text-sm hover:bg-accent">
                Scrollable row {index + 1}
              </p>
            ))}
          </Stack>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </ShowcaseSection>
    </>
  );
}
