<!-- Design standards -->

Web

## IMS UI Standards

### Shell and Navigation

- Use a white, fixed `w-64` desktop sidebar with `border-r border-slate-200`.
- Center `/logo.png` in the sidebar brand area at `h-32 w-auto`, with a bottom rule.
- Sidebar links: `rounded-lg px-3 py-2.5 text-sm font-medium gap-3`.
- Active navigation: `bg-green-50 text-green-700`; active icons: `text-green-600`.
- Inactive navigation: `text-slate-600`; hover uses `bg-green-50 text-green-700`.
- Mobile navigation is an overlay with `bg-black/40`; retain the same sidebar content.
- Header: sticky `h-16`, `border-b border-slate-200/80`, `bg-white/95 backdrop-blur-sm`.
- App content padding: `px-6 py-4`; a feature page may use `p-6`, but do not stack both without intent.

### Color and Borders

- Base canvas: `bg-slate-50` / semantic `bg-surface`; working surfaces are `bg-white`.
- Default boundary: `border border-slate-200`.
- Interior dividers: `border-slate-100`; page/section separators: `border-slate-200`.
- Selected state: `border-green-300 bg-green-50`.
- Primary action: `bg-green-600 text-white hover:bg-green-700`.
- Secondary action: `border border-slate-200 bg-white text-slate-600 hover:bg-slate-50`.
- Destructive action: `border-red-200 text-red-600 hover:bg-red-50`; confirmation uses `bg-red-600`.
- Use blue or sky for links and informational panels, green for success, amber/green for warning, and rose/red for error. Never rely on color alone for status.

### Radius, Elevation, and Spacing

- Default controls and working panels: `rounded-lg`.
- Selectable rows/list cards and empty states: `rounded-xl`.
- Dashboard metrics, analytic cards, and large modal shells: `rounded-2xl`.
- Default panel padding: `p-5`; compact toolbars/filters: `px-4 py-3` or `p-4`.
- Dashboard cards use `p-5`, `shadow-sm`; interactive cards may add `hover:-translate-y-0.5 hover:shadow-md`.
- Do not nest decorative cards. Use one white outer surface with interior dividers where possible.

### Typography

- Use Roboto for UI copy and Nunito only where a display treatment is intentional.
- Page title: `text-3xl font-semibold tracking-tight text-slate-900`.
- Section heading: `text-base` or `text-lg font-semibold text-slate-800/900`.
- Field/table labels: `text-xs font-semibold uppercase tracking-wide text-slate-400/500`.
- Body text: `text-sm`; supporting metadata: `text-xs text-slate-400/500`.

### Tabs, Filters, and Segmented Controls

- Tabs use a shared bottom-rule treatment:
  `flex gap-1 border-b border-slate-200`.
- Each tab: `-mb-px border-b-2 px-3 py-2 text-sm font-medium`.
- Active tab: `border-green-500 text-green-700`; inactive: transparent border, slate text.
- Segmented controls use `rounded-lg border border-slate-200 bg-slate-50 p-0.5`; active option is white with green text.
- Filter bars are white `rounded-lg border border-slate-200 p-4`, responsive with wrapped controls.

### Forms, Drawers, and Dialogs

- Inputs/selects: `rounded-lg border border-slate-200 px-3 py-2 text-sm`.
- Focus state: green in incident/roster flows; standardize on `focus:border-green-400 focus:outline-none`.
- Labels: `mb-1 block text-xs font-medium text-slate-600`.
- Prefer the shared right-side `Drawer` for create/edit workflows. Use centered modals only for compact, focused tasks or confirmations.
- Dialog headers/footers use `border-slate-200`/`border-slate-100`; dialogs use white surfaces and `shadow-2xl`.

### Tables, States, and Status

- Tables sit in a bordered white container with `overflow-x-auto`.
- Header row uses `bg-slate-50`, `text-xs font-semibold uppercase tracking-wide text-slate-500`.
- Body rows use `divide-y divide-slate-100`; optional hover is `hover:bg-green-50/40`.
- Use the shared `Pill` for compact statuses and tags.
- Use `EmptyState` for empty page/list sections and `EmptyTableState` inside tables.
- Error blocks use `rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700`.

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
