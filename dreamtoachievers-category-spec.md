# DreamToAchievers — Multi-Tier Category Architecture & Storefront Filtering
### Technical Specification v1.0

---

## 1. Overview

This spec defines a category system that spans three surfaces — Public Storefront, Partner Dashboard, and Admin CMS — backed by Firestore as the single source of truth. Admins manage categories with no code changes; every write propagates to the storefront in real time via Firestore listeners.

**Goals:**
- No-code category CRUD, reordering, and archiving for admins
- Sub-200ms perceived filtering on storefront and dashboard
- Real-time sync: a category edit in Admin CMS reflects on the storefront without a deploy or cache purge
- Support for **parent → child hierarchy** (e.g., "Health & Wellness" → "Skincare & Beauty" → "Serums")

---

## 2. Data Model (Firestore)

### 2.1 Collection structure

```
/categories/{categoryId}
/categories/{categoryId}/children/{childCategoryId}   // OR flattened with parentId — see 2.3
/products/{productId}                                  // references categoryId(s)
/categoryStats/{categoryId}                             // computed, written by Cloud Function
```

### 2.2 Category document (expanded schema)

```typescript
interface Category {
  id: string;                    // 'cat-skincare'
  name: string;                  // 'Skincare & Beauty'
  slug: string;                  // 'skincare' — used in /products/category/:slug
  description: string;           // editorial overview, 1-2 sentences
  icon: string;                  // lucide-react icon name, e.g. 'Sparkle'
  bannerUrl?: string;             // Firebase Storage URL, 1600x600 recommended
  thumbnailUrl?: string;          // 400x400, used in pill carousel
  featured: boolean;
  sortOrder: number;             // integer, gap-indexed (10, 20, 30...) — see 2.4
  status: 'active' | 'archived' | 'draft';

  // --- Hierarchy ---
  parentId: string | null;       // null = top-level category
  depth: 0 | 1 | 2;              // enforce max 3 tiers (top / sub / leaf)
  childIds: string[];            // denormalized for fast tree rendering

  // --- SEO & metadata ---
  metaTitle?: string;
  metaDescription?: string;

  // --- Computed (written server-side only, never by client) ---
  productCount: number;
  avgProfitMarginPKR: number;

  // --- Audit ---
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;             // admin uid
  archivedAt?: Timestamp;
}
```

### 2.3 Why flattened with `parentId` over subcollections
Use a **flat `/categories` collection with `parentId`**, not nested subcollections. Firestore subcollections make "show me the full tree" and "reorder across levels" expensive (multiple round trips). A flat collection lets you fetch all categories in one query, build the tree client-side, and reorder siblings with a single batched write.

### 2.4 Sort order strategy
Use gap-indexing (10, 20, 30…) rather than sequential (1, 2, 3). Inserting a category between two others just needs a midpoint value (e.g., 15) — no rewrite of every sibling's `sortOrder`. Re-index only when gaps run out (rare, handled by a maintenance Cloud Function).

### 2.5 Computed fields — never trust the client
`productCount` and `avgProfitMarginPKR` are **never written from the browser**. A Cloud Function (Firestore trigger on `/products` writes) recalculates and writes to `/categoryStats/{categoryId}`, which the storefront reads. This prevents race conditions when two partners update products in the same category simultaneously, and keeps the aggregation logic in one place instead of duplicated across three frontends.

---

## 3. Public Storefront (`/products`)

### 3.1 Layout — Mobile (< 768px)
```
┌─────────────────────────────────┐
│  Home / Catalog                 │  ← breadcrumb, truncates on overflow
├─────────────────────────────────┤
│ ○All ●Skincare ○Tech ○Home  →   │  ← horizontal scroll pill carousel
│    (active pill: glow + scale)  │
├─────────────────────────────────┤
│  [Search products...]      🔍   │
├─────────────────────────────────┤
│  Skincare & Beauty      142 →   │  ← tapping a pill can also expand
│  "Clean formulas, real margins" │     an inline sub-category strip
├─────────────────────────────────┤
│  [img] [img]                    │  ← 2-col product grid
│  [img] [img]                    │
└─────────────────────────────────┘
```
- Pill carousel: `overflow-x: scroll`, `scroll-snap-type: x mandatory`, momentum scroll, no visible scrollbar. Active pill gets a soft outer glow (box-shadow, brand-accent color at 40% opacity) plus a 1.03x scale — not a full color invert, which reads as a harsher "selected" state on small screens.
- If a top-level category has children, tapping it reveals a secondary pill row (sub-categories) that slides down — don't navigate away, keep it in-place so the scroll position holds.
- Category header shows live `productCount` from `/categoryStats`, not a client-side `.length` count (which would be wrong until all products load).

### 3.2 Layout — Desktop (≥ 1024px)
```
┌───────────┬─────────────────────────────────┐
│ Sidebar   │ Home / Catalog / Skincare        │
│           ├─────────────────────────────────┤
│ ▸ All     │  Skincare & Beauty        [142]  │
│ ▾ Skincare│  Clean formulas, real margins.   │
│    Serums │  ┌──────┬──────┬──────┐          │
│    Creams │  │ prod │ prod │ prod │          │
│ ▸ Tech    │  ├──────┼──────┼──────┤          │
│ ▸ Home    │  │ prod │ prod │ prod │          │
└───────────┴─────────────────────────────────┘
```
- Left sidebar as a tree with expand/collapse chevrons for parent categories. Live counters next to each node.
- Sidebar is sticky (`position: sticky; top: <header-height>`) so it stays visible on scroll.

### 3.3 Filtering behavior
- **Client-side, not server round-trips.** Load the full active-category tree and the current page's products once; filtering toggles visibility/reruns a memoized filter — no network call per click.
- URL sync: `?category=skincare` (and `&sub=serums` for a child). Use `history.replaceState`, not `pushState`, for filter changes so the back button doesn't require N presses to leave the page — but do `pushState` on the *first* filter interaction per session so back-button-to-unfiltered works once.
- Deep-linking: on load, read the query param, validate it against the live category list (handles the case where a category was archived after the link was shared), and fall back to "All" with a subtle toast if invalid.
- Breadcrumb is derived from the category tree walk (`parentId` chain), not hardcoded.

### 3.4 Empty & edge states
- Zero products in an active category: "No products here yet — check back soon" with a CTA back to "All categories," not a bare empty grid.
- Category archived mid-session (real-time listener fires): if the user is currently filtered to it, show a one-line banner ("This category was just updated") and gracefully fall back rather than yanking the UI.

---

## 4. Partner Dashboard (`/dashboard/products`)

### 4.1 Margin-aware sorting
- Sort control: `Sort by: [Highest margin ▾]` — options are Highest margin, Lowest margin, Most stock, Recently added, per-category or across all.
- Margin figures are pulled from `/categoryStats` and per-product `profitMarginPKR`, never recalculated client-side from cost/price fields the partner can see, to avoid any drift between what's displayed and what Admin's ledger says.
- Table view (desktop) with sortable column headers; card view (mobile) with the sort control as a bottom-sheet picker.

### 4.2 Bulk catalog export
- "Download catalog" button scoped to the current category filter.
- Triggers a Cloud Function (`generateCatalogPdf`) that renders category name, banner, and the filtered product set (image, name, SKU, wholesale price, suggested retail, margin) into a PDF, stores it in Storage, and returns a signed URL — don't generate PDFs client-side; large catalogs (500+ SKUs) will hang the browser.
- Show a progress state ("Preparing your Skincare catalog…") since generation is async, and a toast with the download link when ready, so the partner can navigate away without losing the export.

---

## 5. Admin CMS (`/admin/categories`, `/admin/products`)

### 5.1 Category management table
```
┌───┬──────────────────────┬────────┬────────┬─────────┬────────┐
│ ⠿ │ Name                 │ Status │ Count  │ Featured│ Actions│
├───┼──────────────────────┼────────┼────────┼─────────┼────────┤
│ ⠿ │ ▾ Skincare & Beauty  │ Active │  142   │   ★     │ ✎ 👁 🗑│
│ ⠿ │    └ Serums          │ Active │   38   │         │ ✎ 👁 🗑│
│ ⠿ │    └ Creams          │ Draft  │   12   │         │ ✎ 👁 🗑│
│ ⠿ │ ▾ Tech & Electronics │ Active │   96   │   ★     │ ✎ 👁 🗑│
└───┴──────────────────────┴────────┴────────┴─────────┴────────┘
```
- `⠿` is a drag handle (not the whole row) — dragging reorders siblings only; dragging onto another row's children area re-parents it (with a confirm step, since re-parenting changes the storefront tree and any saved deep-links under the old slug).
- Drag-and-drop writes a single batched Firestore update (new `sortOrder` values for affected siblings) — not one write per row — to avoid partial-reorder states if the connection drops mid-drag.
- Archive is soft-delete: `status: 'archived'`, category and its products disappear from storefront/dashboard but the document and history remain. Hard delete is a separate, confirmation-gated action, disabled entirely while `productCount > 0`.

### 5.2 Create / Edit category form
- Fields map 1:1 to the schema in §2.2. Slug auto-generates from `name` (kebab-case) but stays editable — show a warning if the admin changes the slug on a category with existing inbound links ("Changing this will break existing links to this category").
- Icon picker: searchable grid of the icon set actually available in the frontend bundle (lucide-react), not a free-text field — a mistyped icon name should be impossible, not something that silently renders blank.
- Banner/thumbnail: drag-and-drop upload straight to Firebase Storage, with a crop step to enforce aspect ratio before upload, not after.
- Parent selector: dropdown of existing categories at depth 0–1 only (a leaf can't itself become a parent, since depth is capped at 2). Selecting a parent live-previews where the new category will sit in the tree.

### 5.3 Live preview modal
- Renders the actual `CategoryPill` and `CategoryCard` React components with the form's current (unsaved) values — not a mocked-up static image — so what the admin sees is pixel-identical to what partners/buyers will see. Includes a mobile/desktop toggle in the modal.

### 5.4 Product editor — category assignment
- Multi-select combobox (a product can belong to more than one leaf category, e.g., a "gift set" in both Skincare and a seasonal category), searchable by name, grouped visually by parent.
- Selecting a category shows that category's live `avgProfitMarginPKR` inline, so the admin can sanity-check the product's margin against its category's norm while assigning it.

---

## 6. Real-Time Sync Architecture

- **Storefront & Dashboard:** Firestore `onSnapshot` listener on `/categories` (filtered `status == 'active'`) held at the app shell level, not per-page — so navigating between `/products` and `/dashboard/products` doesn't re-subscribe. Cache the tree in a lightweight store (Zustand) and derive filtered views with selectors.
- **Admin CMS:** listens to the *unfiltered* `/categories` collection (needs drafts and archived too) — a separate subscription, not a superset toggle on the same store, since admin and public views have different security-rule read scopes anyway.
- **Optimistic UI:** reorder and status-toggle actions update local state immediately, then write to Firestore; on write failure, roll back local state and toast an error — don't block the UI on the round trip for these two actions specifically, since they're the ones admins do repeatedly and rapidly.
- **Security rules (sketch):**
  ```
  match /categories/{id} {
    allow read: if resource.data.status == 'active' || request.auth.token.role == 'admin';
    allow write: if request.auth.token.role == 'admin';
  }
  match /categoryStats/{id} {
    allow read: if true;
    allow write: if false; // Cloud Functions only, via Admin SDK
  }
  ```

---

## 7. Design System

Grounded in the subject: this is a **wholesale/affiliate B2B tool** — partners are scanning for margin and stock, not browsing for pleasure. The design should read as fast and legible first, polished second.

- **Palette:** `#12151A` (ink, near-black base for dashboard/admin chrome) · `#F7F5F0` (warm paper, storefront background) · `#2B6E5C` (deep teal, primary action + active states) · `#E8703A` (clay accent, margin/profit highlights only — reserved so it always means "money") · `#8A8578` (muted stone, secondary text/borders)
- **Type:** Display — *Fraunces* (a characterful serif) for storefront category headers and hero moments, used sparingly. Body/UI — *Inter* for everything functional: tables, forms, dashboard. Numeric/margin data — *IBM Plex Mono* at small sizes, so PKR figures and counts align in tables instead of jittering with proportional digits.
- **Category pill states:** default (outline, stone border) → hover (teal border) → active (teal fill, 3px glow at 30% opacity, white text). Never invert to a jarring full-saturation fill — this is scanned repeatedly, not admired once.
- **Signature element:** the margin figure itself is the one place color does real work — `#E8703A` appears *only* on profit/margin numbers across all three surfaces, nowhere else. A partner should be able to scan a page and find the money number by color alone.

---

## 8. Performance & Validation

- Category tree fetch is a single query (`where('status', '==', 'active')`), capped at a realistic max (e.g., 200 categories) — paginate the *admin* table if it grows past that, but never paginate the public tree fetch (it needs to be complete for client-side filtering to work).
- Image assets: banners served via Firebase Storage + a CDN transform (resize/webp) rather than raw uploads, so a 4000px admin upload doesn't ship to mobile as-is.
- Validation on category form: `name` required + unique among siblings, `slug` required + globally unique + kebab-case pattern, `parentId` cannot create a cycle (enforce depth ≤ 2 server-side in a Cloud Function, not just client-side, since the client check can be bypassed).
- Deleting/archiving a parent with active children: block the action with a clear message ("Archive or reassign the 3 subcategories first") rather than silently cascading — cascading archives are the kind of action that's costly to reverse by accident.

---

## 9. Suggested Build Order

1. Firestore schema + security rules + seed script for existing categories
2. Cloud Functions: stats aggregation, catalog PDF generation, depth/cycle validation
3. Admin CMS: table, create/edit form, drag-reorder (get data model right before UI depends on it)
4. Public storefront: pill carousel (mobile) + sidebar tree (desktop) + URL sync
5. Partner dashboard: margin sort + bulk export
6. Real-time listener wiring across all three + optimistic UI pass
7. Design polish pass against §7 tokens, accessibility audit (keyboard nav through pill carousel, focus states, reduced-motion for the glow/scale transitions)
