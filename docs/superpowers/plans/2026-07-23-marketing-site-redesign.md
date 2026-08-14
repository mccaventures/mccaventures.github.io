# MCCA Ventures Marketing Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the MCCA Ventures marketing site from a multi-page brochure (separate Home / Projects listing / per-project detail pages) into a single homepage with a hero and an icon-based project grid, modeled on lionstudios.cc, per `docs/superpowers/specs/2026-07-23-marketing-site-redesign-design.md`.

**Architecture:** Astro static site (unchanged tech stack). The project content collection schema is simplified (drop the markdown body, rename `screenshot` → `icon`). `ProjectCard.astro` is rewritten from a card-that-links-to-a-detail-page into a card that shows a store-link button (if published) or a "Coming Soon" button (if not). The homepage (`index.astro`) absorbs the project grid directly below the hero. The old `/projects/` listing page and `/projects/[slug]/` detail page routes are deleted outright — no redirect, they fall through to the existing 404 page. Nav drops to just the logo and Privacy Policy link.

**Tech Stack:** Astro 5, plain CSS with custom-property design tokens (no framework) — unchanged from the original build.

## Global Constraints

- Static-only Astro site, plain CSS tokens only — reuse the existing tokens in `src/styles/global.css` (`--color-accent: #2b5fff`, `--color-on-accent`, `--space-*`, `--font-sans`); do not introduce a CSS framework or new JS dependency.
- `/projects/` and `/projects/[slug]/` are **removed entirely, not redirected**. Unmatched routes fall through to the existing `src/pages/404.astro`.
- Nav is reduced to the MCCA brand link (→ `/`) and a Privacy Policy link only — no separate "Home" or "Projects" nav items.
- Project content schema becomes: `name` (string), `tagline` (string), `status` (`'live' | 'in-development'`), `icon` (string, nullable), `appStoreUrl` (string, nullable). The markdown body is dropped from the schema's purpose — nothing renders it after this plan.
- Project card behavior: `appStoreUrl` set → renders a real store-link button. `appStoreUrl` null → renders a non-interactive "Coming Soon" button in the same visual slot. `icon` null → renders a neutral placeholder square, never a broken image.
- Hero visual treatment must be CSS-only (gradient/color block) — no custom illustration asset.
- Unaffected by this plan: `src/pages/privacy.astro`, `src/pages/404.astro`, `src/components/Footer.astro`, `.github/workflows/deploy.yml`, `public/CNAME`, contact email `mccaventures@gmail.com`.
- No automated test suite. `npm run build` succeeding, plus manual click-through via `npm run dev`, is the verification gate — consistent with the original build's approach.

---

## File Structure

| File | Change |
|---|---|
| `src/content/config.ts` | Modify — rename `screenshot` field to `icon` |
| `src/content/projects/react.md` | Modify — rename frontmatter field, drop markdown body |
| `src/components/ProjectCard.astro` | Rewrite — new props (`status`, `icon`, `appStoreUrl` instead of `slug`), renders store/coming-soon button instead of linking to a detail page |
| `src/pages/index.astro` | Rewrite — new hero copy + CSS accent block, add project grid section using `getCollection('projects')` |
| `src/components/Nav.astro` | Modify — drop "Home" and "Projects" links, keep brand + Privacy Policy |
| `src/pages/projects/index.astro` | Delete |
| `src/pages/projects/[slug].astro` | Delete |

---

### Task 1: Update project content schema

**Files:**
- Modify: `src/content/config.ts`
- Modify: `src/content/projects/react.md`

**Interfaces:**
- Produces: content collection schema field `icon: string | null` (replaces `screenshot: string | null`), consumed by Task 2's `ProjectCard.astro` and `index.astro`.

- [ ] **Step 1: Rename `screenshot` to `icon` in the schema**

Replace the full contents of `src/content/config.ts`:

```ts
import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    status: z.enum(['live', 'in-development']),
    icon: z.string().nullable().default(null),
    appStoreUrl: z.string().url().nullable().default(null),
  }),
});

export const collections = { projects };
```

- [ ] **Step 2: Update Flash Card's frontmatter, drop the markdown body**

Replace the full contents of `src/content/projects/react.md`:

```markdown
---
name: Flash Card
tagline: Test and train your reaction time with fast-paced reflex mini-games.
status: in-development
icon: null
appStoreUrl: null
---
```

- [ ] **Step 3: Verify the build succeeds**

Run: `npm run build`
Expected: build completes with no errors (the old detail page's `data.screenshot` reference becomes `undefined`, which its existing `{data.screenshot ? ... : placeholder}` conditional already treats as "show placeholder" — no crash; that page is deleted in Task 2 anyway).

- [ ] **Step 4: Commit**

```bash
git add src/content/config.ts src/content/projects/react.md
git commit -m "Rename project icon field, drop unused markdown body from schema"
```

---

### Task 2: Merge Projects into the homepage, remove old routes

**Files:**
- Modify: `src/components/ProjectCard.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/components/Nav.astro`
- Delete: `src/pages/projects/index.astro`
- Delete: `src/pages/projects/[slug].astro`

**Interfaces:**
- Consumes: content collection field `icon: string | null` from Task 1.
- Produces: `ProjectCard` props `{ name: string; tagline: string; status: 'live' | 'in-development'; icon: string | null; appStoreUrl: string | null }`.

This task is one unit because `ProjectCard`'s prop contract changes here — the old `/projects/` pages call it with the old `{ name, tagline, slug }` shape and would render incorrectly if left in place, so they must be deleted in the same commit that changes the component.

- [ ] **Step 1: Rewrite `ProjectCard.astro` as a grid card with a store/coming-soon button**

Replace the full contents of `src/components/ProjectCard.astro`:

```astro
---
interface Props {
  name: string;
  tagline: string;
  status: 'live' | 'in-development';
  icon: string | null;
  appStoreUrl: string | null;
}

const { name, tagline, status, icon, appStoreUrl } = Astro.props;
const statusLabel = status === 'live' ? 'Live' : 'In Development';
---
<div class="card">
  {icon ? (
    <img src={icon} alt={`${name} icon`} class="icon" />
  ) : (
    <div class="icon icon-placeholder" aria-hidden="true"></div>
  )}
  <h2>{name}</h2>
  <p class="tagline">{tagline}</p>
  <span class="status">{statusLabel}</span>
  {appStoreUrl ? (
    <a class="store-link" href={appStoreUrl}>View on the App Store</a>
  ) : (
    <span class="store-link coming-soon">Coming Soon</span>
  )}
</div>

<style>
  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-xs);
    padding: var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: 16px;
    background: var(--color-surface);
  }
  .icon {
    width: 96px;
    height: 96px;
    border-radius: 24px;
    object-fit: cover;
  }
  .icon-placeholder {
    background: var(--color-border);
  }
  .card h2 {
    margin: var(--space-xs) 0 0 0;
    font-size: 1.1rem;
  }
  .tagline {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.95rem;
  }
  .status {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-accent);
  }
  .store-link {
    display: inline-block;
    margin-top: var(--space-xs);
    padding: 0.5rem 1.1rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
  }
  .store-link:not(.coming-soon) {
    background: var(--color-accent);
    color: var(--color-on-accent);
  }
  .store-link.coming-soon {
    background: var(--color-border);
    color: var(--color-text-muted);
    cursor: default;
  }
</style>
```

- [ ] **Step 2: Rewrite the homepage with a hero + project grid**

Replace the full contents of `src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ProjectCard from '../components/ProjectCard.astro';
import { getCollection } from 'astro:content';

const projects = await getCollection('projects');
---
<BaseLayout title="MCCA Ventures">
  <section class="hero">
    <div class="hero-block" aria-hidden="true"></div>
    <div class="hero-content">
      <h1>We build apps people actually want to use.</h1>
      <p class="lead">
        MCCA Ventures is a holding company launching and operating a
        growing portfolio of mobile apps — from games to personal finance
        tools and beyond.
      </p>
    </div>
  </section>
  <section class="projects">
    <h2>Our Apps</h2>
    <div class="grid">
      {projects.map((project) => (
        <ProjectCard
          name={project.data.name}
          tagline={project.data.tagline}
          status={project.data.status}
          icon={project.data.icon}
          appStoreUrl={project.data.appStoreUrl}
        />
      ))}
    </div>
  </section>
</BaseLayout>

<style>
  .hero {
    position: relative;
    overflow: hidden;
    padding: var(--space-lg) var(--space-md);
  }
  .hero-block {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent) 40%, transparent 75%);
    opacity: 0.08;
    z-index: 0;
  }
  .hero-content {
    position: relative;
    z-index: 1;
    max-width: 640px;
    margin: 0 auto;
    text-align: center;
  }
  .hero-content h1 {
    font-size: 2.25rem;
    margin: 0 0 var(--space-sm) 0;
  }
  .lead {
    font-size: 1.2rem;
    color: var(--color-text-muted);
    margin: 0;
  }
  .projects {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 var(--space-md) var(--space-lg);
  }
  .projects h2 {
    text-align: center;
    margin-bottom: var(--space-md);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: var(--space-md);
  }
</style>
```

Note for the implementer: the headline/tagline copy above is a draft. Flag it clearly in your report so the user can review and edit the wording — same as the original homepage copy was reviewed.

- [ ] **Step 3: Delete the old Projects listing and detail pages**

```bash
rm src/pages/projects/index.astro
rm 'src/pages/projects/[slug].astro'
rmdir src/pages/projects
```

- [ ] **Step 4: Update Nav to drop Home and Projects links**

Replace the full contents of `src/components/Nav.astro`:

```astro
<nav class="site-nav">
  <a class="brand" href="/">MCCA Ventures</a>
  <div class="links">
    <a href="/privacy/">Privacy Policy</a>
  </div>
</nav>

<style>
  .site-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-sm) var(--space-md);
    border-bottom: 1px solid var(--color-border);
  }
  .brand {
    font-weight: 700;
    text-decoration: none;
    color: var(--color-text);
  }
  .links {
    display: flex;
    gap: var(--space-md);
  }
  .links a {
    text-decoration: none;
    color: var(--color-text);
  }
  .links a:hover {
    color: var(--color-accent);
  }
</style>
```

- [ ] **Step 5: Verify the build succeeds and old routes are gone**

Run: `npm run build`
Expected: build completes with no errors.

Run: `ls dist/projects 2>&1`
Expected: `ls: dist/projects: No such file or directory` (confirms the old routes no longer produce output).

- [ ] **Step 6: Commit**

```bash
git add src/components/ProjectCard.astro src/pages/index.astro src/components/Nav.astro
git add -u src/pages/projects
git commit -m "Merge Projects into homepage grid, remove standalone Projects routes"
```

---

### Task 3: Manual verification

**Files:** none (verification only, no code changes)

- [ ] **Step 1: Run the build one more time from a clean state**

Run: `npm run build`
Expected: build completes successfully.

- [ ] **Step 2: Start the dev server and check routes**

Run: `npm run dev` (in background)

Then:
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/privacy/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/projects/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/nonexistent/
```
Expected: `/` → 200, `/privacy/` → 200, `/projects/` → 404, `/nonexistent/` → 404.

- [ ] **Step 3: Manually confirm in a browser (or via curl body inspection)**

- Homepage shows hero, then the project grid directly below with no separate page navigation required.
- The Flash Card card shows a "Coming Soon" button (not a real link), since `appStoreUrl` is null.
- The Flash Card card shows the neutral icon placeholder, since `icon` is null.
- Nav shows only the MCCA brand (linking to `/`) and Privacy Policy.
- Footer is unchanged: copyright, contact email, Privacy Policy link.
- Layout holds at a narrow (mobile) viewport width — grid collapses to fewer columns, no horizontal overflow.

- [ ] **Step 4: Stop the dev server**

```bash
lsof -ti:4321 | xargs kill
```
