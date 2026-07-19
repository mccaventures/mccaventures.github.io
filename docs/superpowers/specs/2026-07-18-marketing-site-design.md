# MCCA Ventures LLC Marketing Site — Design Spec

Date: 2026-07-18

## Purpose

Build a simple marketing website for MCCA Ventures LLC, a holding company that
owns a portfolio of mobile applications spanning categories such as gaming and
personal finance (intentionally not limited to any one industry, since the
portfolio will grow). The site introduces the company, lists its current
projects (mobile apps), links to a detail page per project, and links to a
generic privacy policy that covers the app portfolio.

## Tech Stack

- **Astro** (static site generator). Ships zero JS by default, well suited to
  a mostly-static, content-driven site with a handful of pages plus a
  collection of project entries.
- **Plain CSS** with custom properties (CSS variables) for color/spacing/type
  tokens in a global stylesheet, plus scoped `<style>` blocks per component.
  No CSS framework — the site is small enough that a framework would add
  dependency overhead without real benefit.
- No JS framework/UI library. Interactivity needs at this scope are minimal
  (nav, maybe a mobile menu toggle), handled with vanilla JS if needed.

## Hosting & Deployment

- Repo: `git@github.com:mccaventures/mccaventures.github.io.git`. This is a
  **user/org GitHub Pages repo** — content on `main` publishes automatically
  to `https://mccaventures.github.io`, no per-project Pages path config
  needed.
- The local repo's `origin` remote currently points at
  `mccaventures/www` and must be updated to
  `mccaventures/mccaventures.github.io` (the user created the new remote
  repo but has not yet repointed the local clone). This is a local,
  reversible `git remote set-url` change — no push happens until the user is
  ready.
- Custom domain: `mccaventures.com` (already purchased via GoDaddy). A
  `public/CNAME` file containing `mccaventures.com` tells GitHub Pages to
  serve the custom domain. The user will separately add the required DNS
  records at GoDaddy (A records pointing at GitHub Pages' IPs, or an
  ALIAS/ANAME record if GoDaddy supports it for apex domains) — this is an
  external account action outside the scope of code changes, but the spec
  should note the exact records needed.
- Deployment pipeline: GitHub Actions workflow using Astro's official
  `withastro/action`, building and publishing to GitHub Pages on every push
  to `main`.

## Site Structure / Routes

| Route | Purpose |
|---|---|
| `/` | Home — MCCA Ventures LLC intro/mission copy, pointer to Projects |
| `/projects/` | Projects listing — a card per project (name, tagline, link to detail page) |
| `/projects/[slug]/` | Project detail page, generated from the content collection |
| `/privacy/` | Generic privacy policy for a mobile-app holding company |
| `/404` | Default not-found page for unmatched routes (including bad project slugs) |

**Navigation** (every page): Home / Projects / Privacy Policy.

**Footer** (every page): `© MCCA Ventures LLC`, contact email
(`mccaventures@gmail.com`), link to Privacy Policy. Contact is footer-only —
no dedicated Contact page/nav item.

## Content Model

Projects are an Astro **content collection** at `src/content/projects/`, one
Markdown file per project, typed via a `src/content/config.ts` schema:

```yaml
name: string
tagline: string             # short one-line hook
status: "live" | "in-development"
description: markdown body  # longer description, rendered on detail page
screenshot: string | null   # image path; omitted -> layout renders a placeholder
appStoreUrl: string | null  # omitted -> no store link rendered on detail page
```

Adding a new project later means adding one Markdown file — no code changes
required for the listing or detail page to pick it up.

### Launch project: Flash Card

Sourced from the `react` repo's README (`/Users/mmisener/git/react/README.md`):
a SwiftUI iOS app containing reaction-time / reflex mini-games ("Flash Card"
game modes). At launch:

- `status: in-development` — not yet published on the App Store, so
  `appStoreUrl` is omitted and no store-link button renders.
- `screenshot: null` at first — the user will supply screenshot image(s)
  after the initial build, to be dropped into `src/assets/` (or
  `public/images/projects/`) and wired into the frontmatter.

## Page Content

- **Home page copy**: drafted by the assistant as mission-style copy framing
  MCCA Ventures LLC as a holding company building and operating a portfolio
  of mobile applications across categories (gaming, personal finance, and
  others — deliberately non-specific so the copy doesn't need to change as
  the portfolio grows). User reviews/edits during implementation.
- **Privacy policy**: a generic template drafted by the assistant, covering
  typical data an app portfolio might collect (device/usage analytics,
  optionally financial data for finance-category apps), stating no sale of
  personal data, and providing `mccaventures@gmail.com` as the contact
  address. The page will carry a visible note recommending legal review
  before relying on it in production, since this is a template, not
  attorney-drafted text.

## Error Handling

- Unmatched routes (including invalid `/projects/[slug]/` values) render
  Astro's default-pattern `404.astro` page with a link back to Home.
- No project screenshot present → detail page renders a neutral placeholder
  block instead of a broken image.
- No `appStoreUrl` present → the store-link button is omitted entirely
  rather than rendering a dead link.

## Testing / Verification

- `npm run build` must succeed with no broken internal links — the primary
  correctness gate for a static site with no backend.
- Manual verification via `npm run dev`: click through
  Home → Projects → Flash Card detail → Privacy Policy → footer
  contact/privacy links; confirm nav works and the layout holds at mobile
  width.
- No automated test suite is planned at this scope (static content site,
  no business logic to unit test).

## Explicitly Out of Scope

- Actual GoDaddy DNS record changes (the user will do this themselves once
  the site is ready to go live; this spec only defines what records are
  needed).
- App Store listing / publishing the Flash Card app.
- CMS or non-Markdown content editing workflow.
- Analytics, forms, or any dynamic/server-side functionality.
