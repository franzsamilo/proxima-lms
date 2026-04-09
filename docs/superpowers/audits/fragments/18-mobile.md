## 18. Mobile Spot-Check
**What it should do:** No horizontal scroll at 375×812; hamburger reachable; primary buttons unclipped; sidebar overlays correctly on small viewports.

### ⚪ NOTE: Mobile spot-check deferred to runtime audit
- **Feature:** Mobile responsiveness
- **Location:** runtime
- **Roles affected:** ALL
- **Expected (per CLAUDE.md "Responsive Breakpoints"):** Pages ≥1024px show full sidebar; <768px collapses to hamburger + slide-over overlay; tables become stacked card lists; topbar search hidden.
- **Actual:** Not exercised — this audit run is code-only (no browser session). Static review of `src/components/layout/sidebar.tsx` (cross-cutting fragment) confirms a single sidebar component handles both desktop and mobile via responsive classes and the spec'd standalone `components/layout/mobile-nav.tsx` was not found (logged in fragment 17). All other responsive concerns (no horizontal scroll, button clipping, modal sizing) require live measurement.
- **Notes:** Once runtime access is available, exercise the route inventory in spec §18 at 375×812 and reclassify any layout breakage as 🔵 POLISH (or 🟡 BUG if a primary action becomes unreachable).

---

**Coverage:** runtime checks deferred (code-only fallback); related static finding logged under fragment 17 (cross-cutting) for the missing `mobile-nav.tsx` component.
