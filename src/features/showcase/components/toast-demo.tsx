"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

function simulateWork(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 1500);
  });
}

export function ToastDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => toast("A neutral notification.")}>
        Default
      </Button>
      <Button variant="outline" onClick={() => toast.success("The operation completed.")}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toast.error("The operation failed.")}>
        Error
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.promise(simulateWork(), {
            loading: "Working…",
            success: "Done.",
            error: "Failed.",
          })
        }
      >
        Promise
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast("With an action.", {
            action: { label: "Undo", onClick: () => toast("Undone.") },
          })
        }
      >
        Action
      </Button>
    </div>
  );
}
