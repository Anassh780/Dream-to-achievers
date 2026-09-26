# Align Layout Shells with Defined Theme Tokens

Written against: unavailable (not a git repository)

## Evidence chain

- Surface: `src/layouts/PublicLayout.tsx`, `src/layouts/DashboardLayout.tsx`, `src/layouts/AdminLayout.tsx`
- Problem: Outer layout containers hardcode static light-mode hex values (`bg-[#FAF7EF]`, `text-[#1E241F]`, `border-[#E3DCC8]`, `bg-[#F1ECDD]`), bypassing the CSS variable system and causing high-contrast background inversion bugs when the user activates dark mode via `SwitchButton` / `ThemeContext`.
- Design evidence: `src/index.css` lines 4–64 defines canonical design tokens for `:root` and `html.dark` (`--bg`, `--surface`, `--surface-alt`, `--ink`, `--ink-soft`, `--line`, `--primary`, `--accent`).
- Owner: `src/layouts/PublicLayout.tsx`, `src/layouts/DashboardLayout.tsx`, `src/layouts/AdminLayout.tsx`
- Scope and affected surfaces: All 33 routes wrapped by `PublicLayout`, `DashboardLayout`, and `AdminLayout`.
- Uncertainty: none

## Design decision

Replace hardcoded hex color values on top-level layout shells, headers, drawers, sidebars, and footers with CSS custom properties (`var(--bg)`, `var(--ink)`, `var(--surface)`, `var(--surface-alt)`, and `var(--line)`). This restores the binding contract between `ThemeContext` (`html.dark`) and rendered views, allowing dark mode to operate consistently without clashing backgrounds.

## Reuse

- CSS custom properties: `var(--bg)`, `var(--surface)`, `var(--surface-alt)`, `var(--ink)`, `var(--ink-soft)`, `var(--line)`, `var(--primary)`
- Exemplar: `src/index.css:75-94` (`html { background-color: var(--bg); color: var(--ink); }`)

No new primitive is required; existing CSS variables in `src/index.css` express the design system's dual-theme tokens.

## Changes

1. `src/layouts/PublicLayout.tsx`
   - Change: Replace `bg-[#FAF7EF]` and `text-[#1E241F]` on root shell with `bg-[var(--bg)] text-[var(--ink)]`. Replace `bg-[#FAF7EF]/95` and `border-[#E3DCC8]` on sticky nav with `bg-[var(--bg)]/95 border-[var(--line)]`. Replace `bg-[#F1ECDD]` on footer with `bg-[var(--surface-alt)] border-[var(--line)]`.
   - Preserve: Semantic layout structure, sticky positioning, responsive drawer mechanics, and navigation links.
   - Verify: Switching theme toggle updates background, text, and borders dynamically in both light and dark modes.

2. `src/layouts/DashboardLayout.tsx`
   - Change: Replace `bg-[#FAF7EF] text-[#1E241F]` on root wrapper with `bg-[var(--bg)] text-[var(--ink)]`. Replace `bg-white border-[#E3DCC8]` on desktop sidebar and mobile drawer with `bg-[var(--surface)] border-[var(--line)]`.
   - Preserve: Collapsible sidebar state persistence, active link styles, badge counters, and mobile drawer transitions.
   - Verify: Reseller dashboard renders on dark surface in dark mode with dark-mode card and text contrast.

3. `src/layouts/AdminLayout.tsx`
   - Change: Replace `bg-[#FAF7EF] text-[#1E241F]` on root container with `bg-[var(--bg)] text-[var(--ink)]`. Replace `bg-white border-[#E3DCC8]` on sidebar and header bar with `bg-[var(--surface)] border-[var(--line)]`.
   - Preserve: Administrative navigation groups, collapsible drawer, quick switch menu, and pending counter badges.
   - Verify: Admin layout renders cleanly in both light and dark themes without bright light-mode containers bleeding through.

## Scope

- Inherit: All pages rendered via `<Outlet />` inside `PublicLayout`, `DashboardLayout`, and `AdminLayout`.
- Verify: Public marketing pages, partner dashboard, and admin tables/forms under theme toggle.
- Exclude: Third-party embeds, external images, and business logic calculations.

## Validation

- Product: Reseller or administrator navigates the site and toggles light/dark mode via `SwitchButton`.
- Interface: Verify `/`, `/products`, `/dashboard`, `/dashboard/sales`, `/admin`, `/admin/sales` in both 390px mobile viewport and 1440px desktop viewport.
- System: Ensure no parallel color utility overrides or inline hex colors remain on top-level layout containers.
- Repository: `npm run build` -> exit code 0, TypeScript checks pass.

## Stop conditions

- Stop if changing layout classes introduces unstyled elements in nested pages requiring dedicated component tokens beyond the defined `--bg`, `--surface`, `--ink`, and `--line`.

## Design documentation

- After acceptance and validation: Record layout theme token compliance under repository notes.
