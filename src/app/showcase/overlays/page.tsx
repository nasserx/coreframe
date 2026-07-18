import type { Metadata } from "next";
import { TriangleAlertIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ShowcasePageHeader } from "@/features/showcase/components/showcase-page-header";
import { ShowcaseSection } from "@/features/showcase/components/showcase-section";
import { ToastDemo } from "@/features/showcase/components/toast-demo";

export const metadata: Metadata = {
  title: "Overlays",
};

export default function OverlaysPage() {
  return (
    <>
      <ShowcasePageHeader
        title="Overlays"
        description="Dialog, AlertDialog, and toasts. The dialog compositions on this page are server-rendered — interactivity lives entirely in the underlying primitives."
      />
      <ShowcaseSection
        title="Dialog"
        description="Focus trapping, Escape, scroll locking, and labelling wiring come from the primitive. This one embeds a Field composition."
      >
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>Open dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename entry</DialogTitle>
              <DialogDescription>A dialog composing the form primitives.</DialogDescription>
            </DialogHeader>
            <Field>
              <FieldLabel htmlFor="dialog-name">Name</FieldLabel>
              <Input id="dialog-name" defaultValue="Current name" />
            </Field>
            <DialogFooter showCloseButton>
              <Button>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ShowcaseSection>
      <ShowcaseSection
        title="Alert dialog"
        description="role=alertdialog, no backdrop dismissal; the destructive styling is chosen by the caller, not baked in."
      >
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="destructive" />}>
            Delete entry
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia>
                <TriangleAlertIcon />
              </AlertDialogMedia>
              <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ShowcaseSection>
      <ShowcaseSection
        title="Toasts"
        description="The Toaster is mounted once by AppProvider; these buttons call sonner's toast() directly."
      >
        <ToastDemo />
      </ShowcaseSection>
    </>
  );
}
