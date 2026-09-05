# HIS-webapp — Agent Guide

This project is a hospital information system for clinical staff who have **seconds, not minutes**, per screen. Every UI and routing decision must serve **clarity** and **round-trip speed**. This file is the source of truth for the "Clear Round" design system — follow it for every change.

---

## 1. Non-negotiable principles

1. **Signal over decoration.** Color = meaning (normal / watch / critical / info). Never use status color for branding, borders, or emphasis.
2. **Progressive disclosure.** First paint shows what needs a decision _now_. Detail is one click deeper — never buried three levels down.
3. **Stay on the page.** Confirmations, quick edits, and status changes belong in a toast, drawer, or modal — **not** a full route change. Full navigation is reserved for genuinely different contexts (different patient, different module).
4. **State survives navigation.** Sidebar state, notification bell, patient banner, filters, and scroll position must persist when staff bounce between views. This is a **nested-layouts** decision, not a component decision.
5. **One quiet system.** Density varies by module (vitals table is dense; pharmacy queue is scannable). Avoid the "every screen is identical rounded shadow cards" look.

If a change violates any of the above, stop and flag it.

---

## 2. Color tokens (source of truth)

Use these tokens. Do not introduce new colors without updating this file.

| Token               | Hex       | Role                                         |
| ------------------- | --------- | -------------------------------------------- |
| `--surface`         | `#F7F9F8` | App background                               |
| `--surface-raised`  | `#FFFFFF` | Cards, panels, modals                        |
| `--ink`             | `#111827` | Primary text                                 |
| `--ink-muted`       | `#5B6572` | Secondary text, labels                       |
| `--brand`           | `#0E6B5C` | Primary actions, active nav, links           |
| `--brand-hover`     | `#0A5449` | Hover / pressed brand                        |
| `--line`            | `#E3E8E6` | Borders, dividers                            |
| `--status-critical` | `#D0342C` | Critical vitals, allergy flags, overdue meds |
| `--status-watch`    | `#B8790A` | Abnormal-but-not-urgent, pending review      |
| `--status-normal`   | `#1E8A5F` | Normal range, resolved, confirmed            |
| `--status-info`     | `#2563A8` | Scheduled, informational, system messages    |

**Rules:**

- Status colors **always pair with an icon or shape** — never rely on hue alone (colorblind + speed-of-scan).
- Keep everything else visually quiet so red/amber is unmistakable when it appears.
- Every token pair meets WCAG AA at body-text size — preserve that when adding variants.

---

## 3. Typography

Two families, distinct roles:

- **Inter** or **Geist Sans** — all UI text, labels, body, tables. Chosen for numeral legibility (dosages, vitals, timestamps).
- **Geist Mono** or **IBM Plex Mono** — **only** for tabular clinical data that benefits from fixed-width alignment (lab values, MRNs, timestamps _in a table_). Not a stylistic affectation on labels.

Scale (Tailwind-compatible):

```
text-xs    12px   metadata, timestamps
text-sm    14px   body default, table cells
text-base  16px   form inputs, primary reading text
text-lg    18px   card titles
text-xl    22px   section headers
text-2xl   28px   page titles (used sparingly)
```

Paragraph content (notes, patient summaries) stays under **80 characters per line**.

---

## 4. Layout — shell + module model

**App shell** (persists across every module):

```
┌───────────────────────────────────────────────┐
│ Top bar: search patient · notifications · user │
├────────┬──────────────────────────────────────┤
│ Side   │  Module content                       │
│ nav    │  (breadcrumbs → module → sub-view)    │
└────────┴──────────────────────────────────────┘
```

**A module landing view** (Pharmacy, Inventory, Lab, Queue, etc.):

```
┌─ header: module name · primary action ─────────┐
│ [ quick stats strip: 4-5 numbers, not charts ]  │
├─────────────────────────────────────────────────┤
│ filter/search bar                               │
├─────────────────────────────────────────────────┤
│ scannable list/table — status color left-edge   │
│ row → opens a right-hand DRAWER, not a new page  │
└─────────────────────────────────────────────────┘
```

Content is **left-aligned**. Center alignment is reserved for empty states.

---

## 5. Next.js App Router architecture

The folder structure **is** the module boundary. Follow this shape:

```
app/
├─ layout.tsx                     — root: fonts, <Toaster />, providers
├─ auth/                          — minimal chrome, no sidebar
├─ (dashboard)/
│  ├─ layout.tsx                  — persistent shell (sidebar + topbar + @modal slot)
│  ├─ @modal/                     — parallel route for quick-action overlays
│  │  ├─ default.tsx
│  │  └─ (.)patients/[id]/vitals/page.tsx   — intercepted route
│  ├─ patients/
│  │  ├─ layout.tsx               — patient-context layout (banner persists across tabs)
│  │  ├─ page.tsx                 — list / search
│  │  └─ [id]/
│  │     ├─ layout.tsx
│  │     ├─ page.tsx              — overview
│  │     ├─ vitals/page.tsx
│  │     ├─ labs/page.tsx
│  │     └─ medications/page.tsx
│  ├─ pharmacy/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ loading.tsx              — skeleton, not spinner
│  │  └─ inventory/page.tsx
│  ├─ inventory/[dept]/page.tsx
│  ├─ queue/…
│  ├─ lab/…
│  └─ appointments/…
```

**Rules the agent must apply:**

- **Route groups** (`(dashboard)`, `auth`) separate chrome without polluting URLs.
- **`(dashboard)/layout.tsx` mounts once per session.** Do not put state that should persist (sidebar, search, notification listener) below this layout. Do not accidentally remount it by moving providers deeper.
- **`patients/[id]/layout.tsx`** owns the patient banner (name, MRN, allergy flags). It stays pinned while a nurse tabs between vitals/labs/meds — this is the single highest-value nested layout in the app.
- **Quick actions use parallel + intercepting routes** (`@modal`, `(.)route`) so URLs stay deep-linkable but visually only a drawer/modal opens. Prefer this over `router.push` to a new page.
- **`loading.tsx` per module** — scoped skeleton, not a global spinner. Skeleton shape matches the module's actual layout.
- **Server Components by default** for data-heavy list/table views. Only opt into client components for genuine interactivity (drawers, filters with local state, form inputs).

---

## 6. Notifications — Sonner patterns

- **Position:** bottom-right on desktop; bottom-center on mobile/tablet.
- **Durations:** success/info auto-dismiss ~4s.
- **Failures that require action never use a toast.** Use an inline banner or modal — a toast that disappears on a failed medication save is a **patient-safety bug**, not a UX nuance.
- **Voice:** verb matches the button. Log Vitals → "Vitals logged". Not "Submitted successfully."
- **One `<Toaster />` in the root layout.** Modules must not mount their own.
- **`toast.promise` for network-backed drawer/modal actions** — inline "Saving… / Saved / Couldn't save — retry" so staff never guess whether their action landed.

---

## 7. Standard component patterns

When building or modifying UI, prefer these patterns (many already exist under `components/`):

- **Status pill** (`components/pills/pill.tsx`) — colored dot/icon + label. Never color fill alone. Same component across patients/pharmacy/labs so staff learn it once.
- **Drawer-first CRUD** (`components/drawers/*`) — create/edit opens a right-side drawer over the current list. Preserves scroll and filter state.
- **Quick-stats strip** (`components/stats/*`) — 4–5 plain numbers at the top of a module. **Not sparkline charts.**
- **Command palette (⌘K)** — global patient/record search from anywhere in the shell. When adding search entry points, wire them through the palette rather than adding a new search box.
- **Tabs** (`components/layout/tabs.tsx`) — for switching sub-views inside a persistent layout (e.g. patient chart tabs).
- **Empty state** (`components/state/empty.state.tsx`) — the only place center alignment is allowed.

---

## 8. Do / Don't checklist for every change

**Do**

- Reuse existing components in `components/` before creating new ones.
- Put shared state above the layout it's used in (respect the shell + module boundary).
- Open drawers/modals for quick actions; use intercepting routes when the URL should be deep-linkable.
- Pair every status color with an icon.
- Ship a `loading.tsx` skeleton for any new module segment.
- Keep list/table rows scannable — status color on the left edge, key info left-aligned.

**Don't**

- Don't add a new route for a confirm/edit action that could be a drawer.
- Don't introduce new colors, shadows, or radii outside the tokens above.
- Don't use a toast for an error the user must act on.
- Don't mount a second `<Toaster />` or a per-module provider that duplicates root providers.
- Don't center-align content outside empty states.
- Don't use monospace fonts for anything except tabular clinical data.
- Don't wrap every module in identical rounded shadow cards.

---

## 9. When in doubt

Optimize for the nurse with 30 seconds and five patients waiting. If a change makes the screen prettier but slower to scan, it is the wrong change.
