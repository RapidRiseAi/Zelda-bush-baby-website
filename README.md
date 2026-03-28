# Bush Baby Website

Premium, warm, nature-led 3-page cabin website built with Astro for Cloudflare Pages.

## Pages
- `/` Home
- `/about` About
- `/contact` Contact / Book

## Project Structure

```txt
/public
  /logo            # logo + favicon placeholders
  /hero            # hero/section image placeholders
  /carousel        # home carousel image placeholders
  robots.txt
  sitemap.xml
/src
  /components      # Header, Footer, FAQ accordion, Carousel
  /config          # ALL editable business + content config
  /layouts         # Base layout + SEO + JSON-LD
  /pages           # Home, About, Contact
  /styles          # Global design system
/scripts/google-apps-script
  Code.gs          # Apps Script endpoint to sheet + manager email
```

## Local Development

```bash
npm install
npm run dev
```

Build + preview:

```bash
npm run build
npm run preview
```

## Cloudflare Deployment

### Option A (Cloudflare Pages via Git integration)
- Framework preset: **Astro**
- Build command: `npm run build`
- Output directory: `dist`
- Node version: 18+
- Environment variable:
  - `PUBLIC_ENQUIRY_ENDPOINT` = deployed Google Apps Script Web App URL

### Option B (Wrangler deploy command)
This repository includes `wrangler.jsonc` + `worker.js` so a non-interactive `npx wrangler deploy` can publish the static `dist/` output without running adapter auto-configuration.

```bash
npm run build
npx wrangler deploy
```

## Editable Content (Single Source of Truth)

Edit `src/config/site.ts` for:
- business details
- contact details
- navigation
- pricing
- nearby attractions
- FAQ items
- key image paths
- form endpoint fallback value

## Asset Swapping

Replace placeholder files with real images using these exact paths:

- Logo: `public/logo/bush-baby-wordmark.svg`
- Favicon: `public/logo/favicon.svg`
- Home hero: `public/hero/home-hero.svg`
- Experience: `public/hero/experience.svg`
- About hero: `public/hero/about-hero.svg`
- Host image: `public/hero/host.svg`
- Contact hero: `public/hero/contact-hero.svg`
- Carousel: `public/carousel/carousel-01.svg` to `carousel-05.svg`

You may switch to `.jpg/.webp` later by updating the paths in `src/config/site.ts`.

## Enquiry Form Integration

The front-end posts JSON to `PUBLIC_ENQUIRY_ENDPOINT`.

- If endpoint is configured: form submits live.
- If endpoint is missing: form shows a clean fallback status message so UX does not break.

### Google Apps Script setup

1. Create a Google Sheet.
2. Open Apps Script and paste `scripts/google-apps-script/Code.gs`.
3. In Script Properties set:
   - `SHEET_ID` = target Google Sheet ID
   - `MANAGER_EMAIL` = manager receiving enquiry emails
4. Deploy as **Web app** (Execute as: Me, Access: Anyone).
5. Copy web app URL into Cloudflare env var `PUBLIC_ENQUIRY_ENDPOINT`.

## Notes
- Manual enquiry flow only (no calendar booking engine).
- Exact street address is intentionally not prominent on public pages.
- SEO included: per-page metadata, Open Graph, Twitter cards, JSON-LD, robots, sitemap.
