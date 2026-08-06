# Pages Formatting Normalization — Design

## Goal

Normalize text and styling conventions across all files in `src/pages/` (`index.astro`, `404.astro`, `privacy.astro`, `products.astro`) so they read as one consistent system, using `index.astro` as the reference point.

## Changes

### 1. Heading case

Use sentence case for all page headings.

- `privacy.astro`: `<h1>Privacy Policy</h1>` → `<h1>Privacy policy</h1>`
- `products.astro`: `<h1>Our Apps</h1>` → `<h1>Our apps</h1>`
- `index.astro` and `404.astro` already use sentence case; no change.

### 2. Spacing scale

All wrapper `padding` rules use the `var(--space-*)` design tokens defined in `global.css`; no hardcoded rem values.

- `index.astro`'s `.hero` padding changes from `5rem var(--space-md) 4rem` to `var(--space-lg) var(--space-md)`.
- `404.astro`, `privacy.astro`, `products.astro` already use `var(--space-lg) var(--space-md)`; no change.

### 3. CSS style-block formatting

Standardize on the convention already used in `index.astro`, `404.astro`, and `products.astro`:

- 2-space indentation
- One declaration per line
- A space after every `:`
- A space before every `{`

Apply this to `privacy.astro`'s `<style>` block, which currently violates it (e.g. `width:100%;`, `th,td{`, `border:1px solid var(--color-border,#ddd);`). While reformatting, drop the redundant `#ddd` fallback on `var(--color-border, ...)` since `--color-border` is already defined in `global.css`.

### 4. Misc cleanup

- `privacy.astro`: remove the stray blank line before the frontmatter fence (`---`) so the file starts with the fence, matching every other page.
- `index.astro`: remove dead code left over from when products were split into their own page/collection:
  - unused `import ProjectCard from '../components/ProductCard.astro';`
  - unused `import { getCollection } from 'astro:content';` and the `const products = await getCollection('products');` it feeds
  - unused `.section-header` CSS rule (no `.section-header` element exists in the template)

## Out of scope

- `<title>` prop strings: the `"Page — MCCA Ventures"` suffix pattern is already consistent across `404.astro`/`privacy.astro`/`products.astro`, and `index.astro`'s bare `"MCCA Ventures"` is correct for the homepage.
- Semantic wrapper elements: `privacy.astro`'s use of `<article>` instead of `<section>` is an appropriate choice for prose content, not an inconsistency to fix.

## Testing

Visual/manual check only — this is a styling and copy normalization pass with no behavioral logic. After changes, run the dev server and view all four pages to confirm no visual regressions (hero spacing shift on the homepage is expected and intentional).
