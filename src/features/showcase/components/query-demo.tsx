"use client";

import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DemoRecord = Readonly<{
  id: number;
  name: string;
  state: "ready" | "pending";
}>;

/*
 * Simulated latency instead of a real endpoint: the showcase validates the
 * provider wiring, not a backend.
 */
async function fetchDemoRecords(): Promise<DemoRecord[]> {
  await new Promise((resolve) => {
    setTimeout(resolve, 1200);
  });
  return [
    { id: 1, name: "Alpha", state: "ready" },
    { id: 2, name: "Beta", state: "pending" },
    { id: 3, name: "Gamma", state: "ready" },
  ];
}

export function QueryDemo() {
  const { data, isPending, isFetching, refetch } = useQuery({
    queryKey: ["showcase", "records"],
    queryFn: fetchDemoRecords,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? <Spinner data-icon="inline-start" /> : null}
          Refetch
        </Button>
        <p className="text-xs text-muted-foreground">
          Foundation defaults: 60s stale time, no automatic retries. Refetch
          resolves after ~1.2s of simulated latency.
        </p>
      </div>
      {isPending ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>State</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.id}</TableCell>
                <TableCell>{record.name}</TableCell>
                <TableCell>
                  <Badge variant={record.state === "ready" ? "secondary" : "outline"}>
                    {record.state}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
