# MCCA Ventures LLC Marketing Site — Redesign Spec

Date: 2026-07-23

## Purpose

Restructure and restyle the existing marketing site (built per
`2026-07-18-marketing-site-design.md`) to be simpler and more visually
compelling, modeled after mobile game publisher/studio sites — specifically
[lionstudios.cc](https://lionstudios.cc/) — rather than the multi-page
brochure structure originally shipped. The original build (Home page,
separate Projects listing page, per-project detail pages, privacy policy,
404) is functionally complete and already has an open PR; this spec covers
follow-on changes layered on the same branch.

## What's Changing vs. the Original Build

| Area | Before | After |
|---|---|---|
| Homepage | Hero + mission copy, CTA link to `/projects/` | Hero + mission copy + project grid, all on one page |
| Projects listing (`/projects/`) | Dedicated page, grid of project cards | Removed |
| Project detail (`/projects/[slug]/`) | Dedicated page per project | Removed |
| Project card | Links to detail page | Links to store (if published) or shows "Coming Soon" (if not) |
| Nav | Home / Projects / Privacy Policy | Logo (→ `/`) / Privacy Policy |
| Content schema | `name`, `tagline`, `status`, `screenshot`, `appStoreUrl`, markdown body | `name`, `tagline`, `status`, `icon`, `appStoreUrl` — no markdown body |
| Visual style | Neutral light theme, existing tokens | Same light theme and accent color, applied more boldly (hero graphic block, bigger type, grid gallery treatment) |

## What's Unaffected

- `src/pages/privacy.astro` — unchanged.
- `src/pages/404.astro` — unchanged.
- `src/components/Footer.astro` content (`© MCCA Ventures LLC`, contact
  email `mccaventures@gmail.com`, Privacy Policy link) — unchanged.
- `.github/workflows/deploy.yml`, `public/CNAME`, GitHub Pages hosting setup
  — unchanged.
- `src/styles/global.css` design tokens (`--color-accent: #2b5fff`, spacing
  scale, etc.) — reused, not replaced.

## Reference Site Analysis

**lionstudios.cc** (mobile game publisher): fixed header nav, hero section
with a bold headline + tagline over an accent-colored graphic block, a grid
gallery of games (icon, title, store buttons), a testimonial section, and a
publishing CTA, then a footer with legal links.

MCCA is a holding company, not a publisher pitching third-party developers,
so the testimonial and "submit your game" CTA sections don't apply and are
dropped. The parts that do transfer: the bold hero treatment, and presenting
projects as an icon-based grid of cards with direct store links instead of
long-form detail pages.

## Site Structure / Routes (Updated)

| Route | Purpose |
|---|---|
| `/` | Home — hero (headline + tagline) directly above the project grid |
| `/privacy/` | Generic privacy policy (unchanged) |
| `/404` | Not-found page (unchanged); also now catches old `/projects/` and `/projects/[slug]/` URLs since those routes no longer exist |

**Navigation** (every page): MCCA logo/name (links to `/`) and Privacy
Policy. No "Projects" nav item — there's nothing to navigate to separately.

**Footer** (every page): unchanged — `© {year} MCCA Ventures LLC`, contact
email, Privacy Policy link.

## Homepage Layout

1. **Hero**: short headline + one-line tagline, drafted by the assistant
   during implementation (replacing the existing mission-style copy), user
   reviews and edits. Visual treatment: a bold accent-colored geometric
   block or gradient behind the headline, done in CSS only — no custom
   illustration asset required, keeping the "energetic" feel of Lion's hero
   wedge without needing supplied artwork.
2. **Project grid**: a responsive grid of project cards directly below the
   hero, replacing the current `ProjectCard.astro` link-to-detail-page
   behavior.

## Project Card

Each card shows: square icon image, project name, tagline, and status.

- **Published** (`appStoreUrl` set): renders a store-link button (same
  visual treatment as Lion's App Store / Play Store buttons) pointing at
  the URL.
- **Not yet published** (`appStoreUrl` null — e.g. Flash Card today):
  renders a "Coming Soon" button in the same visual slot, styled as
  disabled/non-interactive (not a real link).
- **Missing icon** (`icon` null): renders a neutral placeholder square in
  the icon slot, reusing the same placeholder pattern the original detail
  page used for missing screenshots.
- Cards are no longer links to a detail page — there is no detail page to
  link to.

## Content Model (Updated)

`src/content/config.ts` schema, replacing the original:

```ts
name: string
tagline: string             # short one-line hook
status: "live" | "in-development"
icon: string | null         # square icon image path; null -> placeholder rendered
appStoreUrl: string | null  # null -> "Coming Soon" button rendered instead of store link
```

The markdown body field is dropped — nothing renders it once detail pages
are gone. `src/content/projects/flash-card.md` is updated to match: front
matter only, `icon: null` (unchanged from current `screenshot: null`
intent), `appStoreUrl: null`, `status: in-development`. Its existing
long-form body content is removed from the file since the schema no longer
expects one.

## Error Handling

- Unmatched routes — including the now-removed `/projects/` and
  `/projects/[slug]/` paths — render the existing `404.astro` page.
- Missing `icon` → placeholder square, not a broken image.
- Missing `appStoreUrl` → "Coming Soon" button, not a dead or broken link.

## Testing / Verification

- `npm run build` must succeed with no broken internal links.
- Manual verification via `npm run dev`: confirm the homepage renders hero
  → grid → footer in one scroll, the Flash Card card shows "Coming Soon",
  Privacy Policy nav/footer links work, and old `/projects/` and
  `/projects/[slug]/` URLs fall through to the 404 page. Confirm layout
  holds at mobile width.
- No automated test suite, consistent with the original spec's scope.

## Explicitly Out of Scope

- Custom hero illustration/artwork (CSS-only treatment instead).
- Testimonials or a publisher-style "submit your game" CTA — not applicable
  to a holding company with no external developer clients.
- Any change to hosting, deployment, DNS, or the privacy policy content.
- Re-adding project detail pages (can be revisited later if the portfolio
  grows enough to need longer per-project descriptions).
