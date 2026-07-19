"use client";

import { useQuery } from "@tanstack/react-query";

import { isApiError } from "@/api/errors";
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

import { fetchDemoRecords, showcaseKeys } from "../api";

/*
 * Reference consumer of the data layer (docs/DATA_LAYER.md): typed key from
 * the feature's key factory, fetcher through apiFetch (real HTTP round trip
 * to this repo's own route handler), React Query's signal passed through
 * for cancellation, and the error state rendered from the normalized
 * ApiError shape with a retry path.
 */
export function QueryDemo() {
  const { data, error, isPending, isError, isFetching, refetch } = useQuery({
    queryKey: showcaseKeys.records(),
    queryFn: ({ signal }) => fetchDemoRecords(signal),
  });

  if (isError) {
    return (
      <div role="alert" className="flex flex-col gap-3 rounded-lg border border-destructive/40 p-4">
        <p className="text-sm font-medium text-foreground">Couldn&apos;t load records.</p>
        <p className="text-sm text-muted-foreground">
          {isApiError(error)
            ? `${error.message} (${error.kind}${error.status === null ? "" : ` ${error.status}`})`
            : error.message}
        </p>
        <div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? <Spinner data-icon="inline-start" /> : null}
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? <Spinner data-icon="inline-start" /> : null}
          Refetch
        </Button>
        <p className="text-xs text-muted-foreground">
          Fetched from this app&apos;s own route handler (/api/showcase/records) through apiFetch
          with Zod validation. Foundation defaults: 60s stale time, no automatic retries.
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
            {data.map((record) => (
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
