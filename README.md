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
