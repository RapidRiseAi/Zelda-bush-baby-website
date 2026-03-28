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

#### Keep variables consistent across every deployment (Wrangler)

If your values seem to disappear after each deploy, configure them as **saved project config**, not per-command flags:

1. Put public non-secret vars in `wrangler.jsonc` under `vars` (already scaffolded for `PUBLIC_ENQUIRY_ENDPOINT`).
2. Because Astro is static, also set `PUBLIC_ENQUIRY_ENDPOINT` at **build time**:
   - local: copy `.env.production.example` to `.env.production` and set your URL
   - CI/Cloudflare build: set `PUBLIC_ENQUIRY_ENDPOINT` in the build environment
3. Set secrets once with Wrangler (they persist in Cloudflare until changed):

```bash
npx wrangler secret put ENQUIRY_WEBHOOK_SECRET
```

4. Deploy normally:

```bash
npx wrangler deploy
```

Do **not** rely on one-off CLI flags like `--var` for permanent setup.

#### Required persistent keys for this project

These two values must remain stable between deployments:

- `PUBLIC_ENQUIRY_ENDPOINT` (public, non-secret)  
  - Stored in `wrangler.jsonc` under `vars`.
- `ENQUIRY_WEBHOOK_SECRET` (secret)  
  - Stored in Cloudflare Secrets via `wrangler secret put ENQUIRY_WEBHOOK_SECRET`.

This repo now enables `keep_vars: true` in `wrangler.jsonc` to reduce accidental variable loss during deploys.

#### Cloudflare warning: "Update your wrangler config file with these changes"

If you add `ENQUIRY_WEBHOOK_SECRET` in the Cloudflare dashboard and see this warning, that is expected.

- ✅ For **secrets**, keep them in Cloudflare dashboard / `wrangler secret put`.
- ✅ Do **not** put secret values in `wrangler.jsonc` (that file is committed to git).
- ✅ Continue deploying after saving the secret.
- ✅ For local Wrangler dev, copy `.dev.vars.example` to `.dev.vars` and set local values.

Only non-secret public vars (like `PUBLIC_ENQUIRY_ENDPOINT`) should live in `wrangler.jsonc`.

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
3. In Apps Script click **Project Settings** (⚙️) → **Script properties** → **Add script property** and add:
   - `SHEET_ID` = target Google Sheet ID (copy from the Google Sheet URL between `/d/` and `/edit`).
   - `OWNER_EMAIL` = manager email that should receive booking notifications (for this project: `bushbabybb.info@gmail.com`).
   - `WEBHOOK_SECRET` = optional but recommended shared secret.
   - `BOOKING_SHEET_NAME` = optional (default: `Bookings`).
   - `ARCHIVE_SHEET_NAME` = optional (default: `Archived`).
4. Run `setupSheets` once in Apps Script to build headers + status dropdowns.
5. Add an installable trigger for `onEdit` (Event type: On edit).
6. Deploy as **Web app** (Execute as: Me, Access: Anyone).
7. Copy the deployed web app URL into Cloudflare environment variable `PUBLIC_ENQUIRY_ENDPOINT`.

#### Exact values and where to get them

| Variable | Required | Where to set it | Where to get value |
|---|---|---|---|
| `SHEET_ID` | Yes | Apps Script → Project Settings → Script properties | From Google Sheet URL: `https://docs.google.com/spreadsheets/d/<THIS_PART>/edit` |
| `OWNER_EMAIL` | Yes (for `doPost`) | Apps Script → Project Settings → Script properties | Your manager inbox email, e.g. `bushbabybb.info@gmail.com` |
| `WEBHOOK_SECRET` | Recommended | Apps Script → Project Settings → Script properties | Create a long random string (32+ chars) and match it in your server env |
| `BOOKING_SHEET_NAME` | No | Apps Script → Project Settings → Script properties | Any sheet tab name (defaults to `Bookings`) |
| `ARCHIVE_SHEET_NAME` | No | Apps Script → Project Settings → Script properties | Any sheet tab name (defaults to `Archived`) |

If you see `Error: Missing script property: SHEET_ID`, it means `SHEET_ID` was not saved in Script properties for that Apps Script project.

### Where to put secure config variables

- In Cloudflare Pages/Workers Environment Variables:
  - `PUBLIC_ENQUIRY_ENDPOINT` = your deployed Apps Script URL (used by front-end).
  - `ENQUIRY_WEBHOOK_SECRET` = secret used by your server/proxy to call Apps Script.
- In Apps Script Script Properties:
  - `WEBHOOK_SECRET` = must match `ENQUIRY_WEBHOOK_SECRET`.

> Important: never place secrets in front-end files (`src/config/site.ts`) because browser users can read them.

## Notes
- Manual enquiry flow only (no calendar booking engine).
- Exact street address is intentionally not prominent on public pages.
- SEO included: per-page metadata, Open Graph, Twitter cards, JSON-LD, robots, sitemap.
