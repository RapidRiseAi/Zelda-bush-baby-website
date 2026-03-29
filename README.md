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
- Environment variables:
  - `PUBLIC_ENQUIRY_ENDPOINT` = deployed Google Apps Script Web App URL (also committed in `wrangler.jsonc` so deploys do not remove it)
  - `ENQUIRY_WEBHOOK_SECRET` = same value as your Apps Script `WEBHOOK_SECRET` property (Cloudflare Worker secret)

### Option B (Wrangler deploy command)
This repository includes `wrangler.jsonc` + `worker.js` so a non-interactive `npx wrangler deploy --keep-vars` can publish the static `dist/` output without running adapter auto-configuration.

```bash
npm run build
npx wrangler deploy --keep-vars
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

The front-end posts JSON to `/api/enquiry` on the Worker, and the Worker forwards to `PUBLIC_ENQUIRY_ENDPOINT`.

- This keeps `ENQUIRY_WEBHOOK_SECRET` off the browser and sends it server-side as `payload.secret`.
- If the endpoint is missing, the API returns a config error so you can detect setup issues quickly.


### Troubleshooting failed submissions

If the form says it could not send, the UI now includes the backend error reason in parentheses.
Common causes:
- `Unauthorized request` means `ENQUIRY_WEBHOOK_SECRET` does not exactly match Apps Script `WEBHOOK_SECRET`.
- `Missing Cloudflare variable: PUBLIC_ENQUIRY_ENDPOINT` means the Worker runtime variable is not set in the active environment.
- `Apps Script returned HTTP ...` usually means the Apps Script Web App URL is wrong (must be the deployed `/exec` URL) or access is not set to **Anyone**.

### Google Apps Script setup

1. Create a Google Sheet.
2. Open Apps Script and paste `scripts/google-apps-script/Code.gs`.
3. In Script Properties set:
   - `SHEET_ID` = target Google Sheet ID
   - `OWNER_EMAIL` = manager receiving booking emails
   - `WEBHOOK_SECRET` = shared secret used by the Cloudflare Worker
4. Deploy as **Web app** (Execute as: Me, Access: Anyone).
5. Copy web app URL into Cloudflare variable `PUBLIC_ENQUIRY_ENDPOINT`.
6. Set Cloudflare Worker secret `ENQUIRY_WEBHOOK_SECRET` to the same value as Apps Script `WEBHOOK_SECRET`.

## Notes
- Manual enquiry flow only (no calendar booking engine).
- Exact street address is intentionally not prominent on public pages.
- SEO included: per-page metadata, Open Graph, Twitter cards, JSON-LD, robots, sitemap.
