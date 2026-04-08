## 12. Packages
**What it should do:** List active `LessonPackage` records as three tier-colored cards (Starter/Explorer/Professional) with level badge, price, module/lesson counts, includes checklist, and a Subscribe button. `GET /api/packages` returns active packages to any authenticated role.

### 🟡 BUG: API route requires authentication, spec says open to any role
- **Feature:** Packages (API)
- **Location:** src/app/api/packages/route.ts:6-9
- **Roles affected:** Unauthenticated visitors
- **Expected (per CLAUDE.md):** "GET /api/packages | Any | List active packages" — the "Any" auth column in the API table is interpreted consistently across the spec as "any authenticated role"; however the Packages page itself and the landing-page value prop imply packages are discoverable. At minimum, any authenticated user must succeed.
- **Actual:** Returns 401 when `session?.user` is falsy. This is consistent with "any authenticated role" but note there is no role gating beyond session presence — fine per spec.
- **Repro:** Call `GET /api/packages` without a session cookie → 401. With any logged-in role → 200 with active packages.
- **Notes:** Behavior matches the "Any (authenticated)" reading of the spec. Flagging only because spec text "Any" is ambiguous; current implementation is defensible. No change required unless product wants public browsing.

### 🟡 BUG: Spec requires "Subscribe" button, implementation renders "Browse Courses"
- **Feature:** Packages (Card CTA)
- **Location:** src/components/packages/package-card.tsx:131-135
- **Roles affected:** ALL
- **Expected (per CLAUDE.md "Lesson Package Cards" and "Packages" page spec):** "Subscribe button: full-width primary button."
- **Actual:** Renders `<Button>Browse Courses</Button>` wrapped in `<Link href="/courses?level=...">`.
- **Repro:** Visit `/packages` → card footer shows "Browse Courses" linking to the course list filtered by level rather than a Subscribe action.
- **Notes:** Minor label/behavior drift. Either implement a subscribe flow or update the spec. The current behavior is harmless but off-spec.

### 🟡 BUG: Price rendered in PHP (₱) with 2 decimal places, spec uses USD whole-dollar format
- **Feature:** Packages (Card pricing)
- **Location:** src/components/packages/package-card.tsx:85
- **Roles affected:** ALL
- **Expected (per CLAUDE.md seed + spec):** Seed stores `price: 299 / 499 / 799` and spec describes prices as `$299`, `$499`, `$799`. Card treatment: "Price: Syne 22px weight-800, colored by tier."
- **Actual:** Displays `₱299.00 / package` using `toLocaleString("en-PH", { minimumFractionDigits: 2 })`. Currency symbol and format do not match spec.
- **Repro:** Visit `/packages` → Starter package shows "₱299.00 / package" instead of "$299".
- **Notes:** Likely intentional localization for PH market, but deviates from the canonical spec. Align currency handling with product decision; if PHP is correct, update CLAUDE.md. The "/ package" suffix is also not in the spec but is acceptable polish.

### 🟡 BUG: Stats grid shows Courses + Lessons, spec shows Modules + Lessons
- **Feature:** Packages (Card stats boxes)
- **Location:** src/components/packages/package-card.tsx:93-110; src/app/(dashboard)/packages/page.tsx:27-46
- **Roles affected:** ALL
- **Expected (per CLAUDE.md):** "Stats boxes (Modules/Lessons): surface-3 bg, radius-md, centered, JetBrains Mono 20px weight-700 value + 10px uppercase label." Page spec also says "module/lesson counts".
- **Actual:** First stat box labeled "Courses" and counts `pkg.courses.length`. The page never derives `moduleCount`.
- **Repro:** Visit `/packages` → left stat box shows course count labeled "Courses" instead of module count labeled "Modules".
- **Notes:** Fix in `PackagesPage`: sum `course.modules.length` across courses and pass as `moduleCount`; update card label to "Modules". Lesson count aggregation is already correct.

### 🟡 BUG: Card uses `border border-edge border-t-[3px]` — full border not per spec
- **Feature:** Packages (Card styling)
- **Location:** src/components/packages/package-card.tsx:54-60
- **Roles affected:** ALL (visual)
- **Expected (per CLAUDE.md):** "3px solid top border colored by tier" on an otherwise standard card (`surface-2`, `shadow-card` ring). The shadow-card provides the hairline surround; explicit full `border border-edge` is not specified.
- **Actual:** Applies `border border-edge border-t-[3px]` plus hover `border-edge-strong`, producing a visible full border in addition to the 3px top. Also omits `shadow-[var(--shadow-card)]` so the standard card ring is missing.
- **Repro:** Inspect card in dev tools → 1px edge border on all sides + 3px top, no shadow-card applied.
- **Notes:** Aesthetically close but diverges from the "floating card with top accent" treatment described in the design system. Consider replacing with `shadow-[var(--shadow-card)] border-t-[3px]` and moving border-t color to a dedicated class.

### ⚪ NOTE: Stat value typography 20px vs spec 20px but weight/tracking drift
- **Feature:** Packages (Stat boxes typography)
- **Location:** src/components/packages/package-card.tsx:95-99, 103-107
- **Roles affected:** ALL (visual)
- **Expected (per CLAUDE.md):** "JetBrains Mono 20px weight-700 value + 10px uppercase label"; label tracking per design system is 2px.
- **Actual:** Value uses `font-bold` (700) OK, but label uses `tracking-[0.5px]` instead of the 2px uppercase tracking used elsewhere for mono metadata labels.
- **Repro:** Compare labels to dashboard stat card labels — tracking is noticeably tighter.
- **Notes:** Minor polish.

### ⚪ NOTE: Page heading uses 20/24px, spec page titles are 24px (Syne 700, tracking-tight)
- **Feature:** Packages (Page header)
- **Location:** src/app/(dashboard)/packages/page.tsx:50-52
- **Roles affected:** ALL (visual)
- **Expected (per CLAUDE.md type scale):** Page title (h1): Syne 24px weight-700 tracking -0.5px `ink-primary`.
- **Actual:** Responsive `text-[20px] md:text-[24px]` — on mobile renders 20px.
- **Notes:** Spec does not define a mobile override; the responsive shrink is a reasonable deviation. Flagged for parity only.

### ⚪ NOTE: Package query fetches nested module/lesson IDs twice (page) while API route omits counts
- **Feature:** Packages (API vs page data divergence)
- **Location:** src/app/api/packages/route.ts:11-16; src/app/(dashboard)/packages/page.tsx:10-25
- **Roles affected:** ALL
- **Expected (per spec):** Single source of truth for package shape; either API computes counts or both the API and the page use the same helper.
- **Actual:** The page bypasses `/api/packages` entirely (uses Prisma directly, fine for a server component) and the API route returns raw `LessonPackage` rows with no `moduleCount`/`lessonCount`. Any client consumer of the API would be unable to render the card without extra fetches.
- **Notes:** Not a bug for the page itself (SSR), but the API is incomplete versus the card contract. Consider adding `_count`/nested selects on the API, or documenting that the API is intentionally flat.

### ⚪ NOTE: Tier mapping table duplicates level + tier keys
- **Feature:** Packages (Card tier color lookup)
- **Location:** src/components/packages/package-card.tsx:21-46
- **Roles affected:** None
- **Notes:** `tierTopBorder`, `tierPriceColor`, and `tierCheckColor` each contain both `SchoolLevel` and `Tier` keys. Lookup falls back from level to tier. Works but is defensive duplication; since `getTierFromLevel` provides a 1:1 mapping, one keyset suffices. Low priority cleanup.

### ⚪ NOTE: `description` optional in prop type but seed always provides one
- **Feature:** Packages (Card prop typing)
- **Location:** src/components/packages/package-card.tsx:14
- **Notes:** `description?: string | null` is wider than the Prisma type (`String?` — nullable but present). Acceptable; no action.

---
**Coverage:** Reviewed src/app/(dashboard)/packages/page.tsx, src/app/api/packages/route.ts, src/components/packages/package-card.tsx. Cross-checked against CLAUDE.md "Packages" page spec, API route table, "Lesson Package Cards" design system section, seed data ($299/$499/$799 USD), and typography scale.
