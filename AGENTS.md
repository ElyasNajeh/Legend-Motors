# Legend Motors project instructions

## Scope and source of truth

Legend Motors is a production full-stack automotive showroom: a React/Vite public site and admin UI backed by FastAPI, SQLAlchemy, PostgreSQL, and the existing APIs. The public frontend began as a fashion-store concept and must be converted through targeted changes, not a rewrite.

Preserve the working framework, architecture, backend, admin functionality, localization architecture, useful component and responsive patterns, spacing, typography, animation, transitions, and strong visual identity. Improve unfinished or inappropriate areas without unrelated refactors or unnecessary dependencies.

## Customer journey and product model

The primary journey is: landing page -> browse and filter all cars on the landing page -> choose a car -> car-detail page at its own link -> inspect multiple photos, description, and details -> WhatsApp showroom. Do not create a separate cars or shop page. Make the journey obvious, fast, mobile-first, thumb-friendly, low-friction, and understandable in Arabic and English. WhatsApp is the primary conversion CTA. A car inquiry should prefill useful identification when available: brand, year, car ID, and current car URL. Do not add checkout, cart, prices, or unnecessary e-commerce flows.

Adapt fashion concepts deliberately: products become cars, collections become featured cars or new arrivals, categories become brands, product pages become car-detail pages, and shopping CTAs become car inquiry/WhatsApp actions. Do not use blind text replacement. Never display or add car prices. Car cards should prioritize year + make/model and high-value specifications such as mileage, transmission, and fuel type while preserving useful existing card design.

For the current public landing page, use this order: a hero with language-aware copy alignment and natural Palestinian Arabic; the existing promotional sliders visually overlapping the hero in the selectively adapted Abayate style; a clear separator; the filterable all-cars section; then the footer. Also provide separate About Us and Contact Us pages. Clicking any car opens its own car-detail URL with multiple images, localized description and specifications, and WhatsApp contact.

Use `car` terminology consistently throughout project copy, plans, components, and documentation.

Arabic is the public site's priority language. Reuse the existing localization system; never create separate Arabic and English React pages. Customer-facing Arabic must be natural for Palestinian users, clear rather than excessively slang-heavy (for example: `شوف السيارات`, `احكي معنا`, and `مهتم بهالسيارة`). Preserve clear technical specifications and correct RTL layout, navigation, icon direction, spacing, and interaction behavior.

## Assets and styling

Inspect repository assets before replacing fashion/demo imagery. Use the actual Legend Motors logo, car imagery, and branding assets that exist; do not invent filenames or fabricate missing assets. Use a clearly identified temporary fallback only when necessary.

During Phase 1, if accessible, inspect `C:\Users\USER-Q\Documents\Abayate\src\styles\global.css` read-only. Selectively adapt valuable layout, spacing, animation, card, and responsive rules; do not copy the whole stylesheet or preserve fashion-specific styling. Never modify that external file. If it is unavailable, report that instead of guessing.

## Ownership and agent policy

Only three roles exist unless the user explicitly changes this policy:

- MAIN Codex agent: owns inspection, delegation, reconciliation, planning, all application code edits, and validation.
- `ux_mobile`: read-only mobile UX and conversion specialist.
- `ui_design`: read-only visual design and automotive-adaptation specialist.

The MAIN agent is the only implementation owner. Specialists must never modify files, create implementation code, run formatters or migrations, or audit unrelated backend architecture. Use exactly these two specialists, keep agent use token-conscious, and do not create or spawn other roles unless the user explicitly requests them.

## Delivery workflow

Phase 0 is bootstrap configuration only; start later work in a fresh session so these instructions and agent definitions are loaded.

1. **Main inspection:** MAIN inspects the frontend, backend, router, public/admin pages, APIs, car data model, localization, CSS, assets, reusable components, and responsive behavior. Do not modify source and do not perform an unrelated broad audit.
2. **Specialist review:** Spawn exactly `ux_mobile` and `ui_design` in parallel. Both remain read-only. Wait for both.
3. **One implementation plan:** MAIN inspects the relevant code itself, reconciles overlaps, and produces one P0/P1 plan. For each item identify the page/component, files where possible, current problem, exact change, and UX/UI/both evidence. Also identify what to preserve, fashion-specific adaptations, localization and asset changes, and necessary API/data-model changes. Do not include P2 work unless requested. Stop for user approval before coding.
4. **Implementation:** After approval, MAIN alone implements the approved P0/P1 scope. Work mobile-first, preserve architecture and strong design, avoid unrelated refactors and unnecessary dependencies, and run the appropriate existing type checks, lint, tests, and build validation.
5. **Final specialist review:** Reuse the same `ux_mobile` and `ui_design` agents in parallel. Each returns at most five remaining material findings within its scope and ignores nitpicks. MAIN combines overlaps, reports relevant files/components, does not fix the findings, and waits for user approval.

Plan before code. Never begin Phase 4 without explicit approval of the single reconciled plan. Never implement P2 items unless requested.
