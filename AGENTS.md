# Project-specific rules

## Types and enums

- Before creating or importing a domain type, enum, or union, search the matching `dramas/*-stub/src` package first.
- In view code, use the matching stub export (for example, `@store/store-stub`) as the source of truth.
- Create a local type only when no matching stub type exists, such as for view-only state, form state, or presentation props.
- Do not duplicate an existing stub type or enum inside a view component.

## Readability during refactoring

- When extracting or refactoring a component, add an empty `//` marker immediately after the component function's opening `{`.
- Apply the same rule to functions with substantial logic spanning three or more lines: place an empty `//` marker immediately after the opening `{`.
- Do not leave explanatory or descriptive comment text anywhere in the project; the required `//` markers must remain empty.
- Check this convention in every refactor before considering the change complete; it makes the code easier to scan.

## API hook files and names

- Keep API hooks in the relevant domain's `hooks` folder.
- Use a `.ts` file unless the hook actually contains JSX; an imperative download or export hook without JSX must also use `.ts`.
- Make the file basename and the named hook export identical, for example `useProductsList.ts` must export `useProductsList`.
- Name every fetch hook after the subject and the exact server flow; do not use a generic name such as `useProducts` or `useProductData`.
- Use the `List` suffix for a non-paginated collection flow, such as `useProductsList.ts`.
- Use the `Page` suffix for a server-paginated collection flow, such as `useProductsPage.ts`.
- Use the `Detail` suffix for a single-record flow selected by an identifier, such as `useProductDetail.ts`.
- Use another explicit result suffix such as `Summary`, `Report`, or `Check` only when it describes a distinct stub fetch flow more accurately than `List`, `Page`, or `Detail`.
- Keep each fetch hook file responsible for exactly one `SeekApi.fetch` flow. If a view needs two fetch flows, create two hook files and compose them in the container.
- Keep shared query-key factories in a separate `<domain>Keys.ts` file, such as `productKeys.ts`; do not mix shared key definitions into a fetch or mutation hook.
- Keep all command flows for one domain in one `use<Domain>Mutation.ts` file, such as `useSaleMutation.ts`.
- Consumers must import the specific fetch hook or the domain mutation hook; do not restore broad hooks that group unrelated fetch flows.

## Fetch API hooks

- Treat the matching `dramas/*-stub/src` package as the source of truth for fetch parameter, filter, result, RDO, and page types.
- Build queries through the matching stub factory, for example `ProductSeekApi.fetch.findProducts(params)`, and pass its `queryKey` and `queryFn` to `useQuery`.
- Do not call a raw seek function or a legacy `*Api` view wrapper when a matching `SeekApi.fetch` factory exists.
- Let the stub's query function determine the response type. Do not add a second local response envelope, duplicate the returned DTO/RDO, or use `as any` to reshape it in the view hook.
- Return the TanStack Query result directly so consumers consistently receive `data`, `isLoading`, `isFetching`, `error`, and `refetch`; do not rename or repackage those fields in each hook.
- Keep filter, search, selection, and applied-query state in the page/form/detail container. A fetch hook accepts the current typed parameters and must not own duplicate `query` and `searchQuery` state.
- For a query that requires an identifier, accept the missing state explicitly (`string | null` or `string | undefined`), provide a stable fallback query key/query factory input, and set `enabled: Boolean(id)` so an invalid request is never sent.
- If callers need conditional fetching beyond a required identifier, accept a small query-options argument such as `{ enabled?: boolean }` and default it deliberately.
- Do not manually prefix or rebuild the query key returned by the stub fetch factory. Use a separate domain key factory only for cross-flow invalidation or for a disabled-query fallback that the stub cannot produce safely.

## Non-paginated and paginated fetches

- A `List` hook is only for an endpoint that returns the full filtered collection needed by the consumer. It accepts the matching stub filter type and must not add `page`, `pageSize`, `offset`, or load-more state locally.
- A server-paginated fetch must use a `Page` hook and the stub's matching paginated fetch flow. Do not simulate pagination by repeatedly increasing a non-paginated request's `limit`.
- A `Page` hook receives the current `page`, `pageSize`, and typed filters from its container, passes all of them to the stub fetch factory, and returns the `useQuery` result directly.
- Use the shared `usePagination` hook in the container for URL-backed `page` and `pageSize`; the fetch hook must not own pagination state or expose `changeCurrentPage`, `changePageLimit`, or `resetQuery` handlers.
- Reset the page to `1` in the container when a filter scope or page size changes so the next request cannot point to an invalid page.
- Read rows and totals from the stub page result, normally `data?.items ?? []` and `data?.total ?? 0`, in the container or view composition layer. Do not invent a second `FetchResponse`, `offset`, or total metadata shape in the hook.
- Ensure the stub fetch factory's query key includes every page and filter parameter. Fix the factory in the stub when this is not true instead of appending ad hoc key fragments in the view hook.

## Mutation API hooks

- Use `useMutation` only with command functions from the matching stub `FlowApi`.
- Create one named mutation per command and keep its variable name aligned with the command, for example `createProduct`, `updateProduct`, and `deleteProduct`.
- Pass the `FlowApi` command directly as `mutationFn` when its argument already matches the caller. Use a typed wrapper only when the command needs a compound argument such as `{ id, payload }`.
- Import command payload types from the matching stub. Do not duplicate payload types locally and do not suppress a mismatch with `as any`.
- Return the named mutation objects in one flat object from `use<Domain>Mutation`; do not hide them behind an additional generic `mutation` property.
- Keep command success/error side effects and related query invalidation in the domain mutation hook. Use `useQueryClient` and the relevant `<domain>Keys.ts` factories instead of scattering invalidation across page components.
- Invalidate every affected domain after a successful command, not only the list currently visible. Use the project's localized API error helper and toast convention when the flow exposes user feedback.
- Accept callback options only for genuinely view-specific follow-up behavior; cache consistency must remain inside the mutation hook.

## Page, form, and detail structure

- Every page, form, and detail container must follow the container-view pattern.
- Keep page-specific subcomponents in a `view` folder next to the container.
- Keep table column definitions in the relevant `view` folder and outside the container file.
- Keep container files focused on data loading, state, event handlers, and composition of view components.
