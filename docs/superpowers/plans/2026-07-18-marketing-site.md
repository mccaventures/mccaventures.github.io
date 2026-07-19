# MCCA Ventures Marketing Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a small Astro marketing site for MCCA Ventures LLC with a home page, a Projects listing backed by a content collection, per-project detail pages, and a generic privacy policy page.

**Architecture:** Astro static site (no JS framework), plain CSS with custom-property design tokens, a `projects` content collection (one Markdown file per project) driving `/projects/` and `/projects/[slug]/`, deployed to GitHub Pages from `mccaventures/mccaventures.github.io` via GitHub Actions with a custom `mccaventures.com` domain.

**Tech Stack:** Astro 5, Node 20 (v20.12.2 confirmed installed locally), plain CSS, GitHub Actions (`withastro/action`), GitHub Pages.

## Global Constraints

- Static site only — no server-side/dynamic backend, no CMS, no forms, no analytics.
- Styling is plain CSS with custom properties only — no CSS framework or component library.
- Contact email shown site-wide (footer): `mccaventures@gmail.com`.
- Deploy target repo: `mccaventures/mccaventures.github.io` (already created remotely; local `origin` still points at the old `mccaventures/www` and must be repointed).
- Custom domain `mccaventures.com` is served via `public/CNAME`; actual GoDaddy DNS record changes are the user's responsibility and out of scope for this plan.
- Privacy policy page must include a visible disclaimer that it is a template requiring legal review.
- Project content lives in `src/content/projects/` as Markdown files with frontmatter fields `name`, `tagline`, `status` (`live` | `in-development`), `screenshot` (nullable), `appStoreUrl` (nullable) — adding a project later means adding one file, no code changes.
- No automated test suite — the correctness gate is `npm run build` succeeding plus manual click-through, per the spec.

---

### Task 1: Scaffold the Astro project

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `src/pages/index.astro` (temporary placeholder, replaced in Task 5)

**Interfaces:**
- Produces: an installable, buildable Astro project (`npm run dev`, `npm run build`, `npm run preview` scripts) that later tasks add files into.

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "mccaventures-www",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^5.0.0"
  }
}
```

- [ ] **Step 2: Write `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://mccaventures.com',
});
```

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict"
}
```

- [ ] **Step 4: Write `.gitignore`**

```
node_modules/
dist/
.astro/
.DS_Store
```

- [ ] **Step 5: Write a temporary placeholder `src/pages/index.astro`**

```astro
---
---
<html>
  <head><title>MCCA Ventures LLC</title></head>
  <body><h1>MCCA Ventures LLC</h1></body>
</html>
```

- [ ] **Step 6: Install dependencies**

Run: `npm install`
Expected: completes with no errors, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 7: Verify the build works**

Run: `npm run build`
Expected: exits 0, prints a completed build summary, and creates `dist/index.html`.

Run: `grep -o '<h1>MCCA Ventures LLC</h1>' dist/index.html`
Expected: prints the matched line (confirms the placeholder page built correctly).

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json .gitignore src/pages/index.astro
git commit -m "Scaffold Astro project"
```

---

### Task 2: Point the local repo at the new GitHub Pages remote

**Files:**
- Modify: git remote configuration (no tracked files change)

**Interfaces:**
- Produces: `origin` remote pointing at `mccaventures/mccaventures.github.io`, required by Task 10's deploy workflow assumptions and by any future `git push`.

- [ ] **Step 1: Check the current remote**

Run: `git remote -v`
Expected: shows `origin` pointing at `git@github.com:mccaventures/www.git`.

- [ ] **Step 2: Repoint origin**

Run: `git remote set-url origin git@github.com:mccaventures/mccaventures.github.io.git`

- [ ] **Step 3: Verify**

Run: `git remote -v`
Expected: both `fetch` and `push` lines show `git@github.com:mccaventures/mccaventures.github.io.git`.

No commit needed — this is local git config, not a tracked file.

---

### Task 3: Design tokens and shared layout components

**Files:**
- Create: `src/styles/global.css`
- Create: `src/components/Nav.astro`
- Create: `src/components/Footer.astro`
- Create: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro` (wrap placeholder content in `BaseLayout` to prove it works)

**Interfaces:**
- Produces: `BaseLayout.astro` accepting `Props { title: string }` with a default `<slot />` for page content — every later page task wraps its content in `<BaseLayout title="...">...</BaseLayout>`.
- Consumes: nothing from earlier tasks besides the working Astro project from Task 1.

- [ ] **Step 1: Write `src/styles/global.css`**

```css
:root {
  --color-bg: #ffffff;
  --color-surface: #f5f5f7;
  --color-border: #e0e0e3;
  --color-text: #1a1a1e;
  --color-text-muted: #6b6b70;
  --color-accent: #2b5fff;

  --space-xs: 0.5rem;
  --space-sm: 1rem;
  --space-md: 1.5rem;
  --space-lg: 3rem;

  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--font-sans);
  color: var(--color-text);
  background: var(--color-bg);
  line-height: 1.5;
}

a {
  color: var(--color-accent);
}

h1, h2, h3 {
  line-height: 1.2;
}
```

- [ ] **Step 2: Write `src/components/Nav.astro`**

```astro
<nav class="site-nav">
  <a class="brand" href="/">MCCA Ventures</a>
  <div class="links">
    <a href="/">Home</a>
    <a href="/projects/">Projects</a>
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

- [ ] **Step 3: Write `src/components/Footer.astro`**

```astro
---
const year = new Date().getFullYear();
---
<footer class="site-footer">
  <p>&copy; {year} MCCA Ventures LLC</p>
  <p>
    <a href="mailto:mccaventures@gmail.com">mccaventures@gmail.com</a>
    &middot;
    <a href="/privacy/">Privacy Policy</a>
  </p>
</footer>

<style>
  .site-footer {
    margin-top: var(--space-lg);
    padding: var(--space-md);
    border-top: 1px solid var(--color-border);
    text-align: center;
    color: var(--color-text-muted);
    font-size: 0.9rem;
  }
  .site-footer a {
    color: var(--color-text-muted);
  }
</style>
```

- [ ] **Step 4: Write `src/layouts/BaseLayout.astro`**

```astro
---
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';

interface Props {
  title: string;
}

const { title } = Astro.props;
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
  </head>
  <body>
    <Nav />
    <main>
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 5: Wrap the placeholder home page in `BaseLayout`**

Replace the full contents of `src/pages/index.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="MCCA Ventures LLC">
  <h1>MCCA Ventures LLC</h1>
</BaseLayout>
```

- [ ] **Step 6: Verify the build**

Run: `npm run build`
Expected: exits 0.

Run: `grep -c 'mccaventures@gmail.com' dist/index.html`
Expected: `1` (confirms the footer rendered on the home page).

Run: `grep -c 'Projects</a>' dist/index.html`
Expected: `1` (confirms the nav rendered).

- [ ] **Step 7: Commit**

```bash
git add src/styles/global.css src/components/Nav.astro src/components/Footer.astro src/layouts/BaseLayout.astro src/pages/index.astro
git commit -m "Add design tokens, nav, footer, and base layout"
```

---

### Task 4: Projects content collection

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/projects/flash-card.md`

**Interfaces:**
- Produces: the `projects` collection, schema `{ name: string; tagline: string; status: 'live' | 'in-development'; screenshot: string | null; appStoreUrl: string | null }`, queryable via `getCollection('projects')`. Each entry has Astro's standard `slug` and `data` fields — Task 6 and 7 rely on `project.slug` and `project.data.*` exactly as named here.
- Consumes: nothing beyond the working Astro project.

- [ ] **Step 1: Write `src/content/config.ts`**

```ts
import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    status: z.enum(['live', 'in-development']),
    screenshot: z.string().nullable().default(null),
    appStoreUrl: z.string().url().nullable().default(null),
  }),
});

export const collections = { projects };
```

- [ ] **Step 2: Write `src/content/projects/flash-card.md`**

```markdown
---
name: Flash Card
tagline: Test and train your reaction time with fast-paced reflex mini-games.
status: in-development
screenshot: null
appStoreUrl: null
---

Flash Card is an iOS app built around a collection of reaction-time and
reflex mini-games. Each game mode challenges you to react quickly and
accurately, tracks your personal bests, and helps you sharpen your reflexes
over time.

Flash Card is currently in development and not yet available on the App
Store — check back here for updates.
```

- [ ] **Step 3: Verify the build still succeeds**

Run: `npm run build`
Expected: exits 0 with no schema validation errors (the collection isn't consumed by any page yet, but Astro validates frontmatter against the schema at build time regardless).

- [ ] **Step 4: Commit**

```bash
git add src/content/config.ts src/content/projects/flash-card.md
git commit -m "Add projects content collection with Flash Card entry"
```

---

### Task 5: Home page copy

**Files:**
- Modify: `src/pages/index.astro` (replace placeholder with real copy)

**Interfaces:**
- Consumes: `BaseLayout` from Task 3 (`Props { title: string }`).

- [ ] **Step 1: Replace the full contents of `src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="MCCA Ventures LLC">
  <section class="hero">
    <h1>MCCA Ventures LLC</h1>
    <p class="lead">
      MCCA Ventures LLC is a holding company that builds, launches, and
      operates a growing portfolio of mobile applications.
    </p>
    <p>
      Our team creates focused, well-crafted apps across a range of
      categories — from gaming to personal finance and beyond — each one
      built as its own independent product with its own identity and
      purpose.
    </p>
    <p>
      We believe small, dedicated teams shipping simple, useful software
      beats bloated platforms trying to do everything at once. Every app in
      our portfolio is designed to do one thing well.
    </p>
    <a class="cta" href="/projects/">View our Projects →</a>
  </section>
</BaseLayout>

<style>
  .hero {
    max-width: 640px;
    margin: 0 auto;
    padding: var(--space-lg) var(--space-md);
  }
  .lead {
    font-size: 1.2rem;
    color: var(--color-text-muted);
  }
  .cta {
    display: inline-block;
    margin-top: var(--space-md);
    padding: 0.7rem 1.4rem;
    background: var(--color-accent);
    color: white;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
  }
</style>
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: exits 0.

Run: `grep -c 'View our Projects' dist/index.html`
Expected: `1`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "Add home page copy"
```

---

### Task 6: Projects listing page

**Files:**
- Create: `src/components/ProjectCard.astro`
- Create: `src/pages/projects/index.astro`

**Interfaces:**
- Produces: `ProjectCard.astro` accepting `Props { name: string; tagline: string; slug: string }`, linking to `/projects/${slug}/`.
- Consumes: `BaseLayout` (Task 3), `projects` collection via `getCollection('projects')` (Task 4).

- [ ] **Step 1: Write `src/components/ProjectCard.astro`**

```astro
---
interface Props {
  name: string;
  tagline: string;
  slug: string;
}

const { name, tagline, slug } = Astro.props;
---
<a class="card" href={`/projects/${slug}/`}>
  <h2>{name}</h2>
  <p>{tagline}</p>
</a>

<style>
  .card {
    display: block;
    padding: var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    text-decoration: none;
    color: var(--color-text);
    background: var(--color-surface);
    transition: border-color 0.15s ease;
  }
  .card:hover {
    border-color: var(--color-accent);
  }
  .card h2 {
    margin: 0 0 var(--space-xs) 0;
    font-size: 1.1rem;
  }
  .card p {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.95rem;
  }
</style>
```

- [ ] **Step 2: Write `src/pages/projects/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import ProjectCard from '../../components/ProjectCard.astro';

const projects = await getCollection('projects');
---
<BaseLayout title="Projects — MCCA Ventures LLC">
  <section class="projects">
    <h1>Projects</h1>
    <p class="lead">The apps we're currently building and operating.</p>
    <div class="grid">
      {projects.map((project) => (
        <ProjectCard
          name={project.data.name}
          tagline={project.data.tagline}
          slug={project.slug}
        />
      ))}
    </div>
  </section>
</BaseLayout>

<style>
  .projects {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--space-lg) var(--space-md);
  }
  .lead {
    color: var(--color-text-muted);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: var(--space-md);
    margin-top: var(--space-md);
  }
</style>
```

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: exits 0, creates `dist/projects/index.html`.

Run: `grep -c 'Flash Card' dist/projects/index.html`
Expected: `1` or greater (confirms the card rendered).

Run: `grep -c 'href="/projects/flash-card/"' dist/projects/index.html`
Expected: `1` (confirms the card links to the detail page using the collection slug).

- [ ] **Step 4: Commit**

```bash
git add src/components/ProjectCard.astro src/pages/projects/index.astro
git commit -m "Add projects listing page"
```

---

### Task 7: Project detail page

**Files:**
- Create: `src/pages/projects/[slug].astro`

**Interfaces:**
- Consumes: `BaseLayout` (Task 3), `projects` collection (Task 4) via `getCollection` + `render` from `astro:content`.

- [ ] **Step 1: Write `src/pages/projects/[slug].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map((project) => ({
    params: { slug: project.slug },
    props: { project },
  }));
}

const { project } = Astro.props;
const { data } = project;
const { Content } = await render(project);
---
<BaseLayout title={`${data.name} — MCCA Ventures LLC`}>
  <article class="project-detail">
    <h1>{data.name}</h1>
    <p class="tagline">{data.tagline}</p>
    <p class="status">Status: {data.status === 'live' ? 'Available now' : 'In development'}</p>
    {data.screenshot ? (
      <img src={data.screenshot} alt={`${data.name} screenshot`} class="screenshot" />
    ) : (
      <div class="screenshot-placeholder">Screenshot coming soon</div>
    )}
    <div class="description">
      <Content />
    </div>
    {data.appStoreUrl && (
      <a class="store-link" href={data.appStoreUrl}>View on the App Store</a>
    )}
    <a class="back-link" href="/projects/">← Back to Projects</a>
  </article>
</BaseLayout>

<style>
  .project-detail {
    max-width: 640px;
    margin: 0 auto;
    padding: var(--space-lg) var(--space-md);
  }
  .tagline {
    color: var(--color-text-muted);
    font-size: 1.1rem;
  }
  .status {
    display: inline-block;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-accent);
    margin-bottom: var(--space-md);
  }
  .screenshot {
    width: 100%;
    max-width: 320px;
    display: block;
    border-radius: 12px;
    margin: var(--space-md) 0;
  }
  .screenshot-placeholder {
    width: 100%;
    max-width: 320px;
    aspect-ratio: 9 / 16;
    background: var(--color-surface);
    border: 1px dashed var(--color-border);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
    margin: var(--space-md) 0;
  }
  .description {
    line-height: 1.7;
  }
  .store-link {
    display: inline-block;
    margin-top: var(--space-md);
    padding: 0.6rem 1.2rem;
    background: var(--color-accent);
    color: white;
    border-radius: 8px;
    text-decoration: none;
  }
  .back-link {
    display: block;
    margin-top: var(--space-lg);
    color: var(--color-text-muted);
  }
</style>
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: exits 0, creates `dist/projects/flash-card/index.html`.

Run: `grep -c 'Screenshot coming soon' dist/projects/flash-card/index.html`
Expected: `1` (confirms the placeholder renders since `screenshot` is `null`).

Run: `grep -c 'View on the App Store' dist/projects/flash-card/index.html`
Expected: `0` (confirms the store link is correctly omitted since `appStoreUrl` is `null`).

Run: `grep -c 'reaction-time and' dist/projects/flash-card/index.html`
Expected: `1` (confirms the Markdown body rendered).

- [ ] **Step 3: Commit**

```bash
git add src/pages/projects/[slug].astro
git commit -m "Add project detail page"
```

---

### Task 8: Privacy policy page

**Files:**
- Create: `src/pages/privacy.astro`

**Interfaces:**
- Consumes: `BaseLayout` (Task 3).

- [ ] **Step 1: Write `src/pages/privacy.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Privacy Policy — MCCA Ventures LLC">
  <article class="policy">
    <h1>Privacy Policy</h1>
    <p class="updated">Last updated: July 18, 2026</p>

    <p>
      This Privacy Policy describes how MCCA Ventures LLC ("MCCA Ventures,"
      "we," "us," or "our") collects, uses, and shares information in
      connection with the mobile applications we publish (collectively, the
      "Apps") and this website.
    </p>

    <h2>Information We Collect</h2>
    <p>Depending on the specific App, we may collect:</p>
    <ul>
      <li>
        <strong>Device and usage information</strong>: device type,
        operating system version, app version, crash reports, and general
        usage analytics (e.g., which features are used and how often),
        collected to help us maintain and improve our Apps.
      </li>
      <li>
        <strong>Content you provide</strong>: information you voluntarily
        enter within an App, such as saved preferences, in-app records, or
        data you choose to track (for example, financial entries in a
        personal finance app).
      </li>
      <li>
        <strong>Approximate location</strong>: some Apps may use IP-based or
        device-provided location data to support relevant features; we do
        not collect precise location unless a specific App's in-app
        disclosures state otherwise.
      </li>
    </ul>
    <p>
      We do not require you to create an account or provide personally
      identifiable information to use most of our Apps unless a specific
      App's in-app disclosures state otherwise.
    </p>

    <h2>How We Use Information</h2>
    <ul>
      <li>Operate, maintain, and improve our Apps</li>
      <li>Diagnose technical issues and fix bugs</li>
      <li>Understand aggregate usage patterns</li>
      <li>Comply with legal obligations</li>
    </ul>

    <h2>Sharing of Information</h2>
    <p>We do not sell your personal information. We may share information with:</p>
    <ul>
      <li>
        <strong>Service providers</strong> who help us operate our Apps
        (e.g., crash reporting, analytics, or cloud hosting providers),
        under obligations to protect your information.
      </li>
      <li>
        <strong>Legal authorities</strong>, if required by law or to protect
        the rights, property, or safety of MCCA Ventures, our users, or
        others.
      </li>
    </ul>

    <h2>Data Security</h2>
    <p>
      We take reasonable measures to protect information collected through
      our Apps, but no method of transmission or storage is completely
      secure, and we cannot guarantee absolute security.
    </p>

    <h2>Children's Privacy</h2>
    <p>
      Our Apps are not directed at children under 13, and we do not
      knowingly collect personal information from children under 13. If you
      believe a child has provided us with personal information, please
      contact us so we can remove it.
    </p>

    <h2>Changes to This Policy</h2>
    <p>
      We may update this Privacy Policy from time to time. Changes will be
      posted on this page with an updated "Last updated" date.
    </p>

    <h2>Contact Us</h2>
    <p>
      If you have questions about this Privacy Policy or any of our Apps,
      contact us at
      <a href="mailto:mccaventures@gmail.com">mccaventures@gmail.com</a>.
    </p>

    <p class="disclaimer">
      This is a general privacy policy template intended to cover a
      portfolio of mobile applications. It should be reviewed by legal
      counsel before being relied upon for compliance purposes, and updated
      to reflect the specific data practices of each App as they are
      released.
    </p>
  </article>
</BaseLayout>

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
  .disclaimer {
    margin-top: var(--space-lg);
    padding: var(--space-md);
    background: var(--color-surface);
    border-radius: 8px;
    font-size: 0.9rem;
    color: var(--color-text-muted);
  }
</style>
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: exits 0, creates `dist/privacy/index.html`.

Run: `grep -c 'reviewed by legal counsel' dist/privacy/index.html`
Expected: `1` (confirms the disclaimer required by the Global Constraints is present).

- [ ] **Step 3: Commit**

```bash
git add src/pages/privacy.astro
git commit -m "Add privacy policy page"
```

---

### Task 9: 404 page

**Files:**
- Create: `src/pages/404.astro`

**Interfaces:**
- Consumes: `BaseLayout` (Task 3).

- [ ] **Step 1: Write `src/pages/404.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Page Not Found — MCCA Ventures LLC">
  <section class="not-found">
    <h1>Page not found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <a href="/">← Back to Home</a>
  </section>
</BaseLayout>

<style>
  .not-found {
    max-width: 480px;
    margin: 0 auto;
    padding: var(--space-lg) var(--space-md);
    text-align: center;
  }
</style>
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: exits 0, creates `dist/404.html`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/404.astro
git commit -m "Add 404 page"
```

---

### Task 10: GitHub Pages deployment config

**Files:**
- Create: `public/CNAME`
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md`

**Interfaces:**
- Produces: a GitHub Actions workflow that builds and deploys `main` to GitHub Pages, and a `CNAME` file that makes the deploy serve `mccaventures.com`.

- [ ] **Step 1: Write `public/CNAME`**

```
mccaventures.com
```

- [ ] **Step 2: Write `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3
        with:
          node-version: 20
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: Replace the full contents of `README.md`**

```markdown
# MCCA Ventures LLC — Marketing Site

Marketing website for MCCA Ventures LLC, built with [Astro](https://astro.build).

## Development

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the
site and publishes it to GitHub Pages (`mccaventures/mccaventures.github.io`).
The custom domain `mccaventures.com` is configured via `public/CNAME`; DNS
records at the domain registrar must point to GitHub Pages separately.

## Adding a project

Add a new Markdown file to `src/content/projects/` with frontmatter fields
`name`, `tagline`, `status` (`live` or `in-development`), `screenshot`
(image path or `null`), and `appStoreUrl` (URL or `null`). The Projects
listing and detail pages pick it up automatically — no code changes needed.
```

- [ ] **Step 4: Verify the build is unaffected**

Run: `npm run build`
Expected: exits 0 (these files don't affect the Astro build itself, this just confirms nothing broke).

- [ ] **Step 5: Commit**

```bash
git add public/CNAME .github/workflows/deploy.yml README.md
git commit -m "Add GitHub Pages deployment workflow and custom domain config"
```

---

### Task 11: Final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full clean build**

Run: `rm -rf dist && npm run build`
Expected: exits 0.

- [ ] **Step 2: Confirm every expected route exists**

Run: `ls dist/index.html dist/projects/index.html dist/projects/flash-card/index.html dist/privacy/index.html dist/404.html`
Expected: all five paths listed with no "No such file" errors.

- [ ] **Step 3: Manual click-through on the dev server**

Run: `npm run dev &` (or run in a separate terminal), then:

Run: `curl -s http://localhost:4321/ | grep -c 'View our Projects'`
Expected: `1`

Run: `curl -s http://localhost:4321/projects/ | grep -c 'Flash Card'`
Expected: `1` or more

Run: `curl -s http://localhost:4321/projects/flash-card/ | grep -c 'Back to Projects'`
Expected: `1`

Run: `curl -s http://localhost:4321/privacy/ | grep -c 'mccaventures@gmail.com'`
Expected: `1` or more (appears in both the policy body and the footer)

Stop the dev server afterward (`kill %1` or Ctrl-C in its terminal).

- [ ] **Step 4: Confirm git state is clean**

Run: `git status`
Expected: working tree clean, all task commits present, `origin` remote confirmed pointing at `mccaventures/mccaventures.github.io` (from Task 2).

No further commit needed — this task is verification-only.
