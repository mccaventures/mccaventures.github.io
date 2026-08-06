# Pages Formatting Normalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Normalize text and styling conventions across `src/pages/index.astro`, `404.astro`, `privacy.astro`, and `products.astro` so they read as one consistent system, using `index.astro` as the reference point.

**Architecture:** This is a pure copy/CSS normalization pass — no new components, no logic changes, no new dependencies. Each page file is edited independently and is safe to review/commit on its own. `404.astro` needs no changes and is not touched.

**Tech Stack:** Astro `.astro` page files, plain CSS in `<style>` blocks, existing `--space-*` custom properties from `src/styles/global.css`.

## Global Constraints

- Heading case: sentence case everywhere (e.g. "Privacy policy", not "Privacy Policy").
- Padding on page wrapper elements must use the `var(--space-*)` tokens from `global.css`, never hardcoded rem values.
- CSS style-block formatting convention (already used in `index.astro`/`404.astro`/`products.astro`, must be applied to `privacy.astro` too): 2-space indentation, one declaration per line, a space after every `:`, a space before every `{`.
- No `<title>` prop changes and no semantic-element changes (e.g. `privacy.astro` keeps `<article>`) — explicitly out of scope per spec `docs/superpowers/specs/2026-08-05-pages-formatting-normalization-design.md`.
- No automated test suite covers page markup/CSS in this repo; verification is manual via the dev server (see Task 4).

---

### Task 1: Normalize `index.astro`

**Files:**
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `var(--space-lg)`, `var(--space-md)` from `src/styles/global.css` (`--space-lg: 3rem`, `--space-md: 1.5rem`).
- Produces: nothing consumed by other tasks — `index.astro` has no dependents in this plan.

- [ ] **Step 1: Remove dead imports and unused variable**

In `src/pages/index.astro`, the frontmatter currently is:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ProjectCard from '../components/ProductCard.astro';
import { getCollection } from 'astro:content';

const products = await getCollection('products');
---
```

`ProjectCard` and `products` are never referenced anywhere in the template below. Replace the frontmatter block with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
```

- [ ] **Step 2: Fix hero padding to use the spacing scale**

Find this rule in the `<style>` block:

```css
  .hero {
    max-width: 720px;
    margin: 0 auto;
    padding: 5rem var(--space-md) 4rem;
    text-align: center;
  }
```

Change the `padding` line to:

```css
    padding: var(--space-lg) var(--space-md);
```

- [ ] **Step 3: Remove the unused `.section-header` CSS rule**

Delete this block from the `<style>` section (no element in the template has class `section-header`):

```css
  .section-header {
    margin-bottom: 2rem;
  }

  .section-header h2 {
    font-size: 1rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }
```

- [ ] **Step 4: Verify the final file**

Read `src/pages/index.astro` back and confirm:
- Frontmatter contains only the `BaseLayout` import.
- `.hero` padding reads `var(--space-lg) var(--space-md)`.
- No `.section-header` rule remains.
- The `<h1>We build thoughtful apps for everyday life.</h1>` and `.lead` paragraph are unchanged (already correct per spec).

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "Normalize index.astro: drop dead code, use spacing scale for hero padding"
```

---

### Task 2: Normalize `privacy.astro`

**Files:**
- Modify: `src/pages/privacy.astro`

**Interfaces:**
- Consumes: `var(--color-border)` from `src/styles/global.css` (already defined as `#e0e0e3`, so the local `#ddd` fallback is redundant).
- Produces: nothing consumed by other tasks.

- [ ] **Step 1: Remove the stray leading blank line**

The file currently starts with a blank line before the frontmatter fence:

```
(blank line)
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
```

Remove the leading blank line so the file starts directly with `---` on line 1, matching every other page in `src/pages/`.

- [ ] **Step 2: Change the `<h1>` to sentence case**

Change:

```astro
<h1>Privacy Policy</h1>
```

to:

```astro
<h1>Privacy policy</h1>
```

- [ ] **Step 3: Reformat the `<style>` block to match the project convention**

Replace the entire `<style>` block:

```css
<style>
  .policy {
    max-width: 680px;
    margin: 0 auto;
    padding: var(--space-lg) var(--space-md);
    line-height: 1.7;
  }
  .updated {
    color: var(--color-text-muted);
    font-size: 0.9rem;
  }
  table {
    width:100%;
    border-collapse:collapse;
    margin:1rem 0;
  }
  th,td{
    border:1px solid var(--color-border,#ddd);
    padding:0.6rem;
    text-align:left;
    vertical-align:top;
  }
</style>
```

with:

```css
<style>
  .policy {
    max-width: 680px;
    margin: 0 auto;
    padding: var(--space-lg) var(--space-md);
    line-height: 1.7;
  }

  .updated {
    color: var(--color-text-muted);
    font-size: 0.9rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
  }

  th,
  td {
    border: 1px solid var(--color-border);
    padding: 0.6rem;
    text-align: left;
    vertical-align: top;
  }
</style>
```

Note: `th, td` is split onto two selector lines (one per line) since combining unrelated selectors on one line is the same kind of cramming the reformat is meant to remove, and this matches how a 2-space/one-declaration-per-line convention reads elsewhere in the codebase.

- [ ] **Step 4: Verify the final file**

Read `src/pages/privacy.astro` back and confirm:
- File starts with `---` on line 1 (no leading blank line).
- `<h1>Privacy policy</h1>`.
- `<style>` block matches the formatting shown in Step 3 exactly, including the `var(--color-border)` fallback removal.
- All other page content (paragraphs, table rows, links) is unchanged — this task only touches structure/formatting, not copy.

- [ ] **Step 5: Commit**

```bash
git add src/pages/privacy.astro
git commit -m "Normalize privacy.astro: sentence-case heading, CSS formatting, drop stray blank line"
```

---

### Task 3: Normalize `products.astro`

**Files:**
- Modify: `src/pages/products.astro`

**Interfaces:**
- Consumes: none beyond what the file already imports.
- Produces: nothing consumed by other tasks.

- [ ] **Step 1: Change the `<h1>` to sentence case**

Change:

```astro
<h1>Our Apps</h1>
```

to:

```astro
<h1>Our apps</h1>
```

- [ ] **Step 2: Verify the final file**

Read `src/pages/products.astro` back and confirm only the `<h1>` text changed — imports, the `products.map` loop, and the `<style>` block (which already follows the project's CSS formatting convention and already uses `var(--space-*)` tokens) are untouched.

- [ ] **Step 3: Commit**

```bash
git add src/pages/products.astro
git commit -m "Normalize products.astro: sentence-case heading"
```

---

### Task 4: Manual verification across all pages

**Files:**
- None (verification only).

**Interfaces:**
- Consumes: the finished state of `index.astro`, `privacy.astro`, `products.astro` from Tasks 1–3, and the untouched `404.astro`.
- Produces: nothing (terminal task).

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Visually check each page**

Using a browser (or the claude-in-chrome tool if available), open each of:
- `/` — confirm the hero heading/copy is unchanged. Note the hero's top/bottom padding is now `var(--space-lg)` (3rem/3rem), down from the old `5rem`/`4rem`, so the hero will sit slightly closer to the nav and footer than before — confirm this still reads fine, not cramped.
- `/products` — confirm heading reads "Our apps" and the product grid still renders correctly.
- `/privacy` — confirm heading reads "Privacy policy", the table still renders with visible borders, and all body copy is unchanged.
- `/nonexistent-path` (triggers `404.astro`) — confirm it is unchanged (this file was not touched).

- [ ] **Step 3: Run the project build to catch any syntax errors**

```bash
npm run build
```

Expected: build completes with no errors.

- [ ] **Step 4: Stop the dev server**

Stop the `npm run dev` process started in Step 1.
