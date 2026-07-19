# Data Layer

The contract between products built on this foundation and remote data:
one HTTP client, one error shape, one query key discipline, and route-level
error handling. Reference implementation: the `/showcase/data` page fetching
from this repo's own route handler. Everything here is deliberately minimal —
the foundation defines the shapes a product cannot afford to invent twice,
and stops.

## HTTP client: native fetch (axios removed)

`src/api/client.ts` exports `apiFetch`, a thin wrapper over native `fetch`.

Why fetch and not axios:

- **Next.js integration.** Next extends `fetch` with caching and
  revalidation semantics; axios requests are invisible to that machinery.
  Any server-side data access that wants Next's caching must use fetch, so
  a foundation standardizing on axios would split the data layer in two.
- **Zero bytes.** axios is ~35 kB of client bundle to ship features the
  platform now provides: `AbortSignal.timeout` (timeouts),
  `AbortSignal.any` (cancellation composition), `Response.json`.
- **What axios actually buys — interceptors and error normalization — is
  replaced by a single choke point.** `apiFetch` is the one function every
  request passes through; cross-cutting behavior (auth, tracing, error
  shaping) is written once there, in plain code, instead of registered as
  interceptor middleware.

What `apiFetch` provides:

- Base URL from validated config (`NEXT_PUBLIC_API_BASE_URL` in
  `src/config/env.ts`; empty default = same-origin).
- Default 10 s timeout (`timeoutMs` to override), composed with the
  caller's `AbortSignal` — pass React Query's `signal` through.
- JSON body serialization and `content-type` handling.
- Every failure normalized into `ApiError` (below).
- Opt-in response validation (below).

## The error contract

`src/api/errors.ts` — `ApiError`, a single class with a discriminating
`kind`. Consumers branch on four cases and never on transport details:

| `kind`      | Meaning                                        | Extra fields     |
| ----------- | ---------------------------------------------- | ---------------- |
| `"network"` | No response (offline, DNS, CORS, reset)        | `cause`          |
| `"timeout"` | Client timeout exceeded                        | `cause`          |
| `"http"`    | Non-2xx status                                 | `status`, `body` |
| `"parse"`   | Body unusable (malformed JSON or Zod rejected) | `cause`          |

Always present: `message`, `url`, `name === "ApiError"`. `status` is `null`
except for `"http"`. Narrow with `isApiError(error)`.

Deliberately **not** an error: caller cancellation. When your own
`AbortSignal` aborts, the abort reason is rethrown untouched so React Query
treats it as cancellation, not failure.

Every failure mode has a contract test in `src/api/client.test.ts` — extend
it if you extend the shape, and think twice before extending the shape.

## Response validation: opt-in Zod, explicit opt-out

`apiFetch(path, { schema })` validates the body at the boundary and returns
the schema's inferred type. Without `schema`, the promise resolves to
`unknown` — the type system forces an unvalidated consumer to cast
deliberately at the call site. That is the opt-in mechanism: validation is
the path of least resistance, skipping it is visible in review.

Rationale: validating at the boundary is what makes `"parse"` errors exist
at all — without it, a backend contract drift surfaces as undefined
behavior deep in rendering instead of one typed error at the edge. It is
opt-in (not forced) because some payloads are large and hot, and a product
may reasonably trust its own backend for those; the `unknown` return keeps
that decision explicit.

## Authentication: extension point, not a system

`apiFetch` is the single place every request passes through. A product adds
auth by attaching credentials there — an `Authorization` header read from
its auth state, or `credentials: "include"` for cookie sessions — never per
call site. The marked block in `src/api/client.ts` is the insertion point.
No token storage, refresh flow, or auth provider is prescribed; that is
product territory (the `AppProvider` TODO already reserves the slot).

## React Query contract

Configured in `src/core/providers/query-provider.tsx`, mounted app-wide.

### Query keys: typed factories, no strings at call sites

Each feature owns a key factory next to its fetchers (reference:
`src/features/showcase/api.ts`):

```ts
export const showcaseKeys = {
  all: ["showcase"] as const,
  records: () => [...showcaseKeys.all, "records"] as const,
};
```

Rules:

- One `all` root per feature, named by the feature — roots are unique, so
  keys are collision-free across features by construction.
- Every key spreads its parent — prefix invalidation
  (`invalidateQueries({ queryKey: showcaseKeys.all })`) then works
  structurally.
- Keys are `as const` tuples; parameters become key elements
  (`detail: (id: string) => [...showcaseKeys.all, "detail", id] as const`).
- Call sites use only the factory — a stringly-typed key in a `useQuery`
  call is a review defect.

There is deliberately no generic key-factory helper: the pattern is three
lines per feature, and an abstraction would only obscure what the keys are.

### Caching defaults and when to override

- `staleTime: 60_000` — prevents immediate client refetch of data the
  server just rendered (the React Query SSR recommendation). Override per
  query: near-real-time data lower, immutable reference data higher
  (`staleTime: Infinity`).
- `retry: false` — failures surface immediately; the built-in silent
  triple-retry delays and masks errors during development, and this
  foundation's `ApiError` makes failures cheap to render. Queries hitting
  genuinely flaky upstreams opt in per query (retry only `"network"`/
  `"timeout"`/5xx kinds — never 4xx). This stays right until a product has
  evidence of transient upstream failure, at which point it belongs on the
  affected queries, not back in the defaults.

### Mutations and invalidation

The documented pattern (no shipped abstraction — a mutation without a
product is a demo of nothing):

```ts
const queryClient = useQueryClient();
const createRecord = useMutation({
  mutationFn: (input: NewRecord) =>
    apiFetch("/api/records", { method: "POST", body: input, schema: recordSchema }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: featureKeys.all }),
});
```

Invalidate by the narrowest factory prefix that covers everything the
mutation could have changed; prefer invalidation over manual cache writes
until profiling says otherwise.

### Server prefetch / HydrationBoundary

Nothing in the foundation prefetches (every route is static). When a product
adds a dynamic route that should render with data:

```tsx
// page.tsx (Server Component)
const queryClient = new QueryClient();
await queryClient.prefetchQuery({
  queryKey: featureKeys.records(),
  queryFn: () => fetchRecords(), // needs an absolute NEXT_PUBLIC_API_BASE_URL server-side
});
return (
  <HydrationBoundary state={dehydrate(queryClient)}>
    <ClientPart />
  </HydrationBoundary>
);
```

`query-provider.tsx` already creates a fresh client per server request, so
prefetching composes without cross-request cache leaks. Note the server-side
constraint: relative URLs have no origin in Node — server prefetch requires
an absolute base URL (or calling the data source directly, skipping HTTP).

### Devtools: still absent, deliberately

`@tanstack/react-query-devtools` remains out: the foundation has one demo
query, the devtools are a dependency with UI surface that every clone would
ship (dev-only, but present in every diff and upgrade), and adding them
later is a two-line change documented here:

```tsx
// query-provider.tsx, inside the provider:
<ReactQueryDevtools initialIsOpen={false} />
```

A product whose team debugs cache behavior weekly should add them on day
one. That is the trade-off; it is cheap in either direction.

## Client state vs server cache vs URL state (why zustand was removed)

zustand was declared and never imported; it is removed until a product has
state that needs it. Where state belongs:

- **Server cache — React Query.** Anything fetched: remote entities,
  session-derived data, anything with a source of truth elsewhere. Never
  copy query results into a store; that creates a second, stale source of
  truth.
- **URL — the router.** Anything shareable/bookmarkable/back-buttonable:
  filters, tabs, pagination, selected item, open panel. If reloading the
  page should restore it, it belongs in the URL, not in memory.
- **Local component state — `useState`/`useReducer`.** Interaction state
  owned by one component or lifted one or two levels: input values, open
  flags, optimistic UI.
- **Shared client state — a store, added deliberately.** Only what remains:
  client-owned, cross-feature, not derivable from the above (theme is
  already handled; think cart contents, multi-step wizard drafts). When a
  product genuinely reaches this category, zustand remains the recommended
  choice (`DECISIONS.md`) — add it then, in `src/store`, with the store per
  documented README rules.

Most products reach category four much later than they expect, and the
first three cover the showcase entirely — which is the evidence the removal
rests on.

## Route-level error handling

Three files under `src/app`, all composing the same shared UI
(`src/core/errors/error-fallback.tsx`) that the client `ErrorBoundary` uses
as its default fallback — one presentation for "something broke",
whichever layer catches it:

- **`error.tsx`** — catches page/nested-layout errors, including Server
  Component failures the client ErrorBoundary can never see. Renders inside
  the root layout (theme/fonts/direction intact). Recovery:
  `unstable_retry()` (Next 16), which re-fetches and re-renders the failed
  segment — plain `reset()` would re-render without re-fetching and cannot
  recover a failed server render.
- **`global-error.tsx`** — fires only when the root layout itself throws,
  and replaces it, so it rebuilds the document shell: `lang`/`dir` from
  `APP_CONFIG`, the shared font variables (`src/app/fonts.ts`), the
  stylesheet, and the theme. Theme needs both halves: the inline pre-paint
  script (executes when the error page is server-rendered) **and** an
  effect calling `applyStoredTheme()` — verified in a production build:
  a client-side render error swaps the document without executing injected
  scripts, and React wipes the `dark` class while recreating `<html>`.
- **`not-found.tsx`** — all unmatched URLs and explicit `notFound()` calls;
  static, themed, with a home link as the recovery path.

Layering: the route files are the outer net (server + routing failures);
the core `ErrorBoundary` remains the tool for **region-level** containment
inside a working page (see `/showcase/feedback`). Both render
`ErrorFallback`, so adding monitoring later instruments one component's
call sites.

Browser coverage: `tests/e2e/errors.spec.ts` (404 route + boundary
recovery). `error.tsx`/`global-error.tsx` have no permanent browser test —
that would require shipping a deliberately throwing route; their document
shell was verified manually as described above.

## Pointing a product at its own backend

1. Set `NEXT_PUBLIC_API_BASE_URL` (absolute URL; required for any
   server-side fetching, optional for same-origin browser calls).
2. Per feature: an endpoint module like `src/features/showcase/api.ts` —
   Zod schemas for the wire format, a key factory, fetchers passing
   `signal` through to `apiFetch`.
3. Auth: extend the marked block in `src/api/client.ts`.
4. Error UX: consume `ApiError.kind` in query error states (reference:
   `query-demo.tsx`); leave transport details out of components.
5. Delete the showcase endpoint (`src/app/api/showcase/records/route.ts`)
   with the rest of the showcase when it has served its purpose.
