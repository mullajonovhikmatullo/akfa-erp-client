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

## API hooks

- Keep each fetch API hook in its own file.
- Name fetch hooks with an explicit flow suffix such as `List`, `Detail`, or `Page`; avoid generic fetch hook names.
- A fetch hook file must be responsible for one stub API flow only; keep shared query-key definitions in a separate file.
- Keep all command API flows for one domain in a single hook file with the `Mutation` suffix, such as `useSaleMutation`.
- Update consumers to import the specific fetch hook or domain mutation hook instead of grouping unrelated fetch flows together.

## Page, form, and detail structure

- Every page, form, and detail container must follow the container-view pattern.
- Keep page-specific subcomponents in a `view` folder next to the container.
- Keep table column definitions in the relevant `view` folder and outside the container file.
- Keep container files focused on data loading, state, event handlers, and composition of view components.
