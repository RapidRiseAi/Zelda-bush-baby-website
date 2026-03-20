# Mobile Premium UI Investigation & Execution Plan

## Current state (what we found)

### 1) Mobile currently inherits desktop structure
- Core layout systems (`.split`, `.grid-3`, `.footer-grid`, `.facts-grid`) collapse to one column at `max-width: 900px`.
- This is responsive, but still desktop-first because it mainly stacks desktop sections instead of using mobile-native composition.
- The key media query lives in one global block, making mobile and desktop coupled.

### 2) Header/navigation is functional but not premium yet
- Mobile nav is a simple show/hide panel (`.mobile-nav.open`) driven by a menu button.
- There is no full-screen sheet, animation hierarchy, sticky action, or prominent booking CTA treatment.

### 3) Hero and sections are not mobile-optimized for scanning
- Hero keeps large desktop rhythm (`min-height: 66vh`) and desktop content flow.
- Information-heavy sections (facts strip, pricing, attractions, FAQ) are not reorganized into compact mobile cards/rails.

### 4) Carousel behavior is responsive, but not mobile-tailored
- Carousel width/position values are adjusted in media query, but interaction model is still desktop-centric.
- No explicit touch affordances, reduced-motion strategy, or mobile-first image hierarchy.

### 5) Editing model does not support separate mobile/desktop composition
- Pages are authored once in Astro templates with shared classes.
- This makes content easy to maintain, but mobile and desktop cannot be edited independently at layout/component level.

## Target vision
Create a **dual presentation system**:
1. **Shared content model** (single source of truth for text, prices, FAQs, attractions).
2. **Separate view components** for mobile and desktop (independently editable).
3. **Mobile design system** tuned for premium hospitality brands: strong visual hierarchy, immersive imagery, concise copy blocks, elegant spacing, high-contrast CTAs.

---

## Recommended architecture (separate editing without content drift)

### A) Keep content centralized
- Keep existing content in `src/config/site.ts` (or split into modular content files later).
- Do **not** duplicate content text across mobile and desktop templates.

### B) Split page composition by viewport
For each page:
- Create `DesktopHome.astro` + `MobileHome.astro` (same for About/Contact).
- In the route page (`index.astro`, `about.astro`, `contact.astro`), render both wrappers and control visibility with utility classes:
  - `.desktop-only` shown at `min-width: 901px`
  - `.mobile-only` shown at `max-width: 900px`

This gives true independent layout editing while keeping one route and one content source.

### C) Split styling tokens and layer styles
- Keep global foundation tokens in `global.css` (`colors`, `typography`, spacing primitives).
- Add:
  - `mobile.css` for mobile component styles and rhythm
  - `desktop.css` for desktop-specific style refinements
- Avoid mixing large mobile overrides into desktop classes.

### D) Introduce section-level component pairs where needed
High impact sections should have separate mobile/desktop components:
- Hero
- Facts/value props
- Pricing snapshot
- Attractions cards
- CTA banner

This makes premium mobile polish easier and safer to iterate.

---

## Mobile premium design blueprint

### 1) Hero (highest priority)
- Use a tighter mobile hero (about 72–78svh) with gradient overlay tuned for text legibility.
- Add compact trust row under headline (e.g., "Private cabin · Sabie · Self-catering").
- Use one strong primary CTA and one subtle secondary link.
- Add soft edge blur/overlay card around copy for luxury feel.

### 2) Mobile-first information architecture
Reorder mobile sections for conversion:
1. Hero + CTA
2. Key trust facts (3–4 premium badges)
3. Photo story rail (swipe-friendly)
4. Pricing summary card
5. Nearby highlights (horizontal cards)
6. FAQ accordion
7. Sticky bottom CTA

Desktop can keep broad narrative layout while mobile follows a conversion flow.

### 3) Card and typography refinements
- Increase whitespace cadence (e.g., 14/20/28 spacing rhythm).
- Use stronger heading contrast and smaller paragraph blocks (2–4 lines max per paragraph chunk).
- Upgrade cards with layered shadows, subtle borders, and warm neutral gradients.

### 4) Navigation upgrade
- Replace basic dropdown with full-screen mobile menu sheet.
- Add clear close icon, page links, and persistent "Enquire Now" action.
- Prevent body scroll when menu is open.

### 5) CTA system
- Add sticky bottom mobile CTA bar on key pages:
  - "Check availability"
  - "WhatsApp"
- Keep accessible contrast and safe-area spacing.

### 6) Motion and touch quality
- Use gentle transitions (180–260ms), avoid excessive motion.
- Ensure carousel supports swipe gestures and larger touch targets.
- Respect `prefers-reduced-motion`.

---

## Execution roadmap

### Phase 1 (foundation: 1–2 days)
- Add `mobile-only` / `desktop-only` visibility utilities.
- Create `mobile.css` and `desktop.css` and wire into layout.
- Extract shared semantic components and tokens.

### Phase 2 (home page mobile premium pass: 2–3 days)
- Build `MobileHome.astro` with reordered conversion-focused sections.
- Implement upgraded hero, trust badges, swipe rail, pricing card, sticky CTA.
- Improve mobile nav sheet and animation.

### Phase 3 (about/contact mobile pass: 1–2 days)
- Build `MobileAbout.astro` and `MobileContact.astro` with concise, premium flow.
- On contact page: simplify form spacing, stepper-style grouping, persistent submit visibility.

### Phase 4 (quality gates: 1 day)
- Test key breakpoints: 360, 390, 414, 768, 900, 1024.
- Check Core Web Vitals, image sizing, CLS, and touch accessibility.
- Run quick usability sweep for readability and CTA clarity.

---

## Success criteria (definition of done)
- Mobile and desktop layouts are editable independently without content duplication.
- Mobile bounce-prone sections are replaced with concise, premium-scannable blocks.
- Navigation and CTA paths are clearly stronger on mobile.
- No regressions on desktop layout.
- Lighthouse mobile scores improve for performance and accessibility.

## Immediate next implementation slice
1. Create mobile/desktop wrapper utilities and split Home into separate view components.
2. Launch redesigned mobile hero + trust badges + sticky CTA.
3. Replace mobile nav with full-screen sheet.
4. Validate on real device widths and iterate before applying same pattern to About/Contact.
