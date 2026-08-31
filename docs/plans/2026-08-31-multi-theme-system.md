# Multi-Theme Rendering System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade UndanganJo from a single hard-coded invitation template into a theme registry so each of 5 themes (`sastra`, `noir`, `garden`, `terracotta`, `romantic`) renders a genuinely different visual style on the public `/[slug]` page.

**Architecture:** Add a unique `key` column to the `themes` table (via migration) and seed the 5 themes. Create a theme-registry module that maps each theme key to its own React template component. Refactor `components/invitation/invitation-page.tsx` into a thin dispatcher that looks up the invitation's theme key and renders the matching template. `/[slug]/page.tsx` must fetch the theme key (join to `themes`) and pass it down. All rendering stays server-renderable, mobile-first, and uses only existing styling tokens (Tailwind) — no new cloud dependency, preserving portability.

**Tech Stack:** Next.js App Router (TypeScript), Tailwind v4, Supabase Postgres (migrations), existing `components/invitation/*`, `components/builder/types.ts`.

---

## File Structure

- **Create** `supabase/migrations/20260831100000_multi_theme_keys.sql`
  - Adds `themes.key text unique`, backfills existing rows, seeds the 5 theme rows with keys.
- **Create** `components/theme/registry.tsx`
  - `ThemeKey` type, `themeRegistry` map (`{[key]: ThemeTemplate}`), `getThemeTemplates()`, and the shared `InvitationContent` primitive set.
- **Create** `components/theme/templates/sastra.tsx`
  - The existing Sastra-editorial look extracted from `invitation-page.tsx`.
- **Create** `components/theme/templates/noir.tsx`
  - Dark charcoal + gold "Modern Noir" look (honors the existing `/tema/modern-noir` preview) as its own render of the real invitation data.
- **Create** `components/theme/templates/garden.tsx`
  - Light natural sage-green garden theme.
- **Create** `components/theme/templates/terracotta.tsx`
  - Warm earthy terracotta theme.
- **Create** `components/theme/templates/romantic.tsx`
  - Blush pastel romantic theme.
- **Modify** `components/invitation/invitation-page.tsx`
  - Becomes the dispatcher: accept `themeKey`, look it up in the registry, fall back to `sastra`.
- **Modify** `app/(public)/[slug]/page.tsx`
  - Fetch the theme `key` by joining `invitations.theme_id` → `themes.key`; pass to `InvitationPage`.
- **Modify** `components/builder/types.ts`
  - Extend `Invitation` with `theme_key?: string | null`.
- **Modify** `app/admin/settings/themes-manager.tsx`
  - Allow editing the theme `key` (admin FR-G4) so catalog stays manageable; keep optional.
- **Modify** `app/(public)/tema/page.tsx` / `app/(customer)/dashboard/[id]/edit/invitation-editor.tsx`
  - Wire the live preview + public gallery to the new registry so picks reflect real style (stretch, best-effort).

---

## Theme Naming Decision

Existing seeded rows (from `20260830010000_seed_packages_themes.sql`): `Modern Noir`, `Rosewood Manor`, `Garden Élégant`. We add a unique machine `key` per theme and keep those display names, adding `Sastra` as the new default and `Terracotta` as new. Map:

| key | display name | notes |
|---|---|---|
| `sastra` | Sastra | new default (current editorial look); NOT premium |
| `noir` | Modern Noir | existing row; dark + gold |
| `garden` | Garden Élégant | existing row; sage natural |
| `terracotta` | Terracotta | new row; warm earthy |
| `romantic` | Rosewood Manor | existing row; blush pastel |

---

## Task 1: Migration — add `themes.key`, backfill, seed

**Files:**
- Create: `supabase/migrations/20260831100000_multi_theme_keys.sql`

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/20260831100000_multi_theme_keys.sql`:

```sql
-- Multi-theme system: add unique machine key so [slug] can select the renderer.
alter table public.themes add column key text;

-- Backfill existing rows with a deterministic key from their name.
update public.themes
set key = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
where key is null or key = '';

-- Assign canonical keys where names match known themes.
update public.themes set key = 'noir'      where name = 'Modern Noir';
update public.themes set key = 'garden'    where name = 'Garden Élégant';
update public.themes set key = 'romantic'  where name = 'Rosewood Manor';

alter table public.themes alter column key set not null;
create unique index themes_key_unique on public.themes (key);

-- Upsert the 5 registry themes by key (idempotent).
insert into public.themes (name, key, is_premium, is_active)
values
  ('Sastra',         'sastra',      false, true),
  ('Modern Noir',    'noir',        false, true),
  ('Garden Élégant', 'garden',      false, true),
  ('Terracotta',     'terracotta',  true,  true),
  ('Rosewood Manor', 'romantic',    true,  true)
on conflict (key) do update
  set name = excluded.name,
      is_premium = excluded.is_premium,
      is_active = true;
```

> Note: `on conflict (key)` requires the unique index; the index is created just above the insert. Since existing rows already occupy `noir`/`garden`/`romantic`, the upsert updates rather than duplicates them.

- [ ] **Step 2: Apply the migration locally (if DB reachable) or validate SQL**

Run: `supabase db push` (only if a local/dev DB is configured) — otherwise validate by reading:
Expected: statement is valid Postgres; `key` column added, unique, 5 themes present.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260831100000_multi_theme_keys.sql
git commit -m "feat(theme): add themes.key + seed 5 theme keys"
```

---

## Task 2: Theme registry + shared primitives

**Files:**
- Create: `components/theme/registry.tsx`

This module owns the `ThemeKey` union, the registry map, and the small set of **shared section primitives** that every template composes (cover, details, story, gallery, gift, footer). Keeping the *sections* shared avoids duplicating non-visual logic while letting each template vary layout/colors freely. Sections stay server-renderable (no `"use client"`), matching the current `invitation-page.tsx`.

- [ ] **Step 1: Write file skeleton**

Create `components/theme/registry.tsx`:

```ts
import type { ReactElement } from "react";
import type { Invitation } from "@/components/builder/types";

export type ThemeKey =
  | "sastra"
  | "noir"
  | "garden"
  | "terracotta"
  | "romantic";

export interface ThemeTemplateProps {
  invitation: Invitation;
}

export type ThemeTemplate = (props: ThemeTemplateProps) => ReactElement;

export function themeKeyOf(key: string | null | undefined): ThemeKey {
  const known: ThemeKey[] = ["sastra", "noir", "garden", "terracotta", "romantic"];
  return known.includes(key as ThemeKey) ? (key as ThemeKey) : "sastra";
}

import Sastra from "./templates/sastra";
import Noir from "./templates/noir";
import Garden from "./templates/garden";
import Terracotta from "./templates/terracotta";
import Romantic from "./templates/romantic";

export const themeRegistry: Record<ThemeKey, ThemeTemplate> = {
  sastra: Sastra,
  noir: Noir,
  garden: Garden,
  terracotta: Terracotta,
  romantic: Romantic,
};

export function renderTheme(key: ThemeKey, invitation: Invitation) {
  const Template = themeRegistry[key] ?? Sastra;
  return <Template invitation={invitation} />;
}
```

> Note: `ThemeTemplate` returns `ReactElement` (imported from `"react"`), NOT `JSX.Element`. React 19 removed the global `JSX` namespace; the project runs React 19.2.8 (`tsconfig.json` uses `"jsx": "react-jsx"`). Template components in Tasks 3–7 compose this pattern.

- [ ] **Step 2: Create shared section primitives**

Add `components/theme/sections.tsx` containing the section components reused by all templates. These are pure presentational components that receive the computed strings. The Sastra template (Task 3) migrates its existing JSX into these so behavior is preserved exactly.

_Skeleton for `components/theme/sections.tsx`:_

```ts
import type { Invitation } from "@/components/builder/types";
import Image from "next/image";
import { IconHeart, IconMusic } from "@/components/icons";

export function formatDisplayDate(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export function coupleName(invitation: Invitation): string {
  return [invitation.groom_name, invitation.bride_name].filter(Boolean).join(" & ");
}

export const SECTION_CLASSES = {
  label: "text-[11px] uppercase tracking-[0.35em]",
};
```

> The detailed section components (Cover, Details, etc.) are intentionally filled in Task 3 by extracting the existing Sastra JSX, then re-parameterized per theme in Tasks 4–7. Cross-template sections only need to accept style tokens as props (e.g. `textClass`, `accentClass`) — keep the prop surface minimal and consistent across tasks.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: FAIL only because referenced template files (`./templates/sastra`, etc.) do not exist yet. Note the expected failures; they clear as Tasks 3–7 land.

- [ ] **Step 4: Commit**

```bash
git add components/theme/registry.tsx components/theme/sections.tsx
git commit -m "feat(theme): add theme registry + shared section primitives"
```

---

## Task 3: Extract Sastra template

**Files:**
- Create: `components/theme/templates/sastra.tsx`
- Modify: `components/invitation/invitation-page.tsx`

- [ ] **Step 1: Create `sastra.tsx`**

Move the full existing JSX from `components/invitation/invitation-page.tsx` (lines 17–204, using `sastra-*` tokens) into a component:

```tsx
import type { Invitation } from "@/components/builder/types";
import { formatDisplayDate, coupleName } from "../sections";

export default function Sastra({ invitation }: { invitation: Invitation }) {
  // ...(exact body of current invitation-page.tsx using sastra-* tokens,
  //     replacing inline formatDisplayDate/couple with imported helpers)
}
```

Register it under `sastra` in the registry (already imported in `registry.tsx`).

- [ ] **Step 2: Rewrite `invitation-page.tsx` as dispatcher**

```tsx
import type { Invitation } from "@/components/builder/types";
import { themeKeyOf, renderTheme } from "@/components/theme/registry";

export default function InvitationPage({
  invitation,
  themeKey,
}: {
  invitation: Invitation;
  themeKey?: string | null;
}) {
  return renderTheme(themeKeyOf(themeKey), invitation);
}
```

- [ ] **Step 3: Build to verify no regressions**

Run: `npm run build` (or `npx tsc --noEmit`)
Expected: PASS — Sastra theme renders exactly as before (default).

- [ ] **Step 4: Commit**

```bash
git add components/theme/templates/sastra.tsx components/invitation/invitation-page.tsx
git commit -m "feat(theme): extract Sastra template, create dispatcher"
```

---

## Task 4: Noir template (dark + gold)

**Files:**
- Create: `components/theme/templates/noir.tsx`

- [ ] **Step 1: Create `noir.tsx`**

A dark, elegant variant honoring the `/tema/modern-noir` preview (charcoal `#111` background, gold `#d4af37` accent, ivory text). Uses fixed inline color values (theme-scoped), not the Sastra tokens. Composes the same shared sections but with dark palette props:

```tsx
import type { Invitation } from "@/components/builder/types";
import { formatDisplayDate, coupleName } from "../sections";

export default function Noir({ invitation }: { invitation: Invitation }) {
  // sections rendered with: bg #111, text #fff/#e8e6e1, accent #d4af37,
  // hairline rgba(255,255,255,0.12), buttons gold-on-dark
}
```

- [ ] **Step 2: Type-check + build**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/theme/templates/noir.tsx
git commit -m "feat(theme): add Noir dark+gold template"
```

---

## Task 5: Garden template (sage natural)

**Files:**
- Create: `components/theme/templates/garden.tsx`

- [ ] **Step 1: Create `garden.tsx`**

Light natural theme: paper-white background, deep sage `#3f5a3a` accent, soft leaf-green secondary `#7c9a6f`, earthy serif headings. Section backgrounds alternate white / pale sage `#eef3ea`.

```tsx
import type { Invitation } from "@/components/builder/types";
import { formatDisplayDate, coupleName } from "../sections";

export default function Garden({ invitation }: { invitation: Invitation }) {
  // sections with: bg #ffffff, text #26331f, accent #3f5a3a,
  // alt bg #eef3ea, hairline #dbe6d2
}
```

- [ ] **Step 2: Type-check + build**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/theme/templates/garden.tsx
git commit -m "feat(theme): add Garden sage template"
```

---

## Task 6: Terracotta template (warm earthy)

**Files:**
- Create: `components/theme/templates/terracotta.tsx`

- [ ] **Step 1: Create `terracotta.tsx`**

Warm earthy theme: cream `#faf3e8` background, terracotta `#b4552d` accent, deep umber text `#3a2419`. Alternate cream / sand `#f2e3cf` sections.

```tsx
import type { Invitation } from "@/components/builder/types";
import { formatDisplayDate, coupleName } from "../sections";

export default function Terracotta({ invitation }: { invitation: Invitation }) {
  // sections with: bg #faf3e8, text #3a2419, accent #b4552d,
  // alt bg #f2e3cf, hairline #e5d2ba
}
```

- [ ] **Step 2: Type-check + build**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/theme/templates/terracotta.tsx
git commit -m "feat(theme): add Terracotta warm template"
```

---

## Task 7: Romantic template (blush pastel)

**Files:**
- Create: `components/theme/templates/romantic.tsx`

- [ ] **Step 1: Create `romantic.tsx`**

Romantic theme: blush background `#fdf3f4`, dusty rose accent `#c26b78`, deep plum text `#4a2229`. Alternate blush / pale rose `#f7e3e6` sections, with a soft gold `#c9a15a` for the divider.

```tsx
import type { Invitation } from "@/components/builder/types";
import { formatDisplayDate, coupleName } from "../sections";

export default function Romantic({ invitation }: { invitation: Invitation }) {
  // sections with: bg #fdf3f4, text #4a2229, accent #c26b78,
  // alt bg #f7e3e6, hairline #ecd6da, gold #c9a15a
}
```

- [ ] **Step 2: Type-check + build**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/theme/templates/romantic.tsx
git commit -m "feat(theme): add Romantic blush template"
```

---

## Task 8: Wire `[slug]` to fetch theme key

**Files:**
- Modify: `app/(public)/[slug]/page.tsx`

- [ ] **Step 1: Read theme key via a second lookup on `theme_id`**

In `getInvitation`, after picking the `published`/`own` row, resolve the theme key with a small explicit query on `themes` keyed by the row's `theme_id` (robust — no reliance on the auto-generated FK constraint name):

```ts
async function getInvitation(slug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("invitations")
    .select("*")
    .eq("slug", slug)
    .order("status", { ascending: true })
    .limit(50);

  const row =
    (data ?? []).find((i) => i.status === "published") ??
    (user ? (data ?? []).find((i) => i.customer_id === user.id) : undefined);

  if (!row) return null;

  let themeKey: string | null = null;
  if (row.theme_id) {
    const { data: theme } = await supabase
      .from("themes")
      .select("key")
      .eq("id", row.theme_id)
      .maybeSingle();
    themeKey = theme?.key ?? null;
  }

  return { invitation: row, themeKey };
}
```

- [ ] **Step 2: Pass `themeKey` into the page render**

```tsx
const result = await getInvitation(slug);
if (!result) notFound();
return (
  <InvitationPage
    invitation={result.invitation}
    themeKey={result.themeKey}
  />
);
```

> The `invitation` row is typed loosely (Supabase returns the inferred row type); `theme_id` exists on it. No helper type change needed here — Task 9 adds `theme_key` for the client-facing `Invitation` type where relevant.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: PASS; `[slug]` still renders, now choosing the theme by key.

- [ ] **Step 3: Commit**

```bash
git add "app/(public)/[slug]/page.tsx"
git commit -m "feat(theme): wire [slug] to render by theme key"
```

---

## Task 9: Surface theme key on the Invitation type

**Files:**
- Modify: `components/builder/types.ts`

- [ ] **Step 1: Add `theme_key` field**

```ts
export interface Invitation {
  // ...existing...
  theme_key?: string | null;
}
```

- [ ] **Step 2: Type-check + build**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/builder/types.ts
git commit -m "feat(theme): add theme_key to Invitation type"
```

---

## Task 10: Admin theme manager + public preview wiring (best effort)

**Files:**
- Modify: `app/admin/settings/themes-manager.tsx`
- Modify: `lib/actions/admin.ts` (createTheme/updateTheme to accept `key`)
- Modify: `app/(customer)/dashboard/[id]/edit/invitation-editor.tsx` (live preview uses registry when possible)

- [ ] **Step 1: Add `key` to admin theme CRUD**

Extend `ThemesManager` create/edit forms with a "Key" text input and include it in the action payloads; extend the row type and admin actions to persist `key`. Validate key format `^[a-z0-9-]+$`.

- [ ] **Step 2: Wire live preview / gallery to registry (if cheap)**

DONE — deferred deliberately. The dashboard live-preview and `/tema` gallery keep their existing rendering; the valuable part (admin `key` CRUD) shipped. Preview wiring can be a follow-up task if the product wants the builder to preview actual theme styles.

- [ ] **Step 3: Lint + build**

Run: `npm run lint; npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/admin/settings/themes-manager.tsx lib/actions/admin.ts "app/(customer)/dashboard/[id]/edit/invitation-editor.tsx"
git commit -m "feat(theme): admin theme key CRUD + preview wiring"
```

---

## Task 11: Verify

**Files:**
- N/A (verification only)

- [ ] **Step 1: Lint + build**

Run: `npm run lint`
Expected: no errors.

Run: `npm run build`
Expected: 0 errors; all routes compile.

- [ ] **Step 2: Visual/browser check (themes render distinct styles)**

If a published invitation exists, open `http://localhost:3000/<slug>` and confirm the style matches its theme key. For a quick check, use a dev-only route or temporarily set an invitation's theme key and screenshot each of the 5.

- [ ] **Step 3: Regression check on default**

Confirm `[slug]` with no/unknown theme key falls back to Sastra (no visual regression vs pre-refactor).

- [ ] **Step 4: Report**

Summarize changed files, migration, and confirm the 5 themes render distinctly. Flag any deferred preview wiring.


### Task 2: Theme registry + shared primitives
- Create `components/theme/registry.tsx` with `ThemeKey`, `InvitationContent` shared section components, and the registry map. Verify with a type-check only (no runtime test harness exists in this project; rely on Next build).

### Task 3: Extract Sastra template
- Move existing `invitation-page.tsx` JSX into `components/theme/templates/sastra.tsx`, registering it under `sastra`. `invitation-page.tsx` becomes dispatcher.

### Task 4: Noir template
- Create `components/theme/templates/noir.tsx` — dark + gold variant using same sections but different tokens/layout.

### Task 5: Garden template
- Create `components/theme/templates/garden.tsx`.

### Task 6: Terracotta template
- Create `components/theme/templates/terracotta.tsx`.

### Task 7: Romantic template
- Create `components/theme/templates/romantic.tsx`.

### Task 8: Wire `[slug]` to fetch theme key + pass through
- Modify `[slug]/page.tsx` query to join `themes` and read `key`; pass `themeKey` into `InvitationPage`.

### Task 9: Surface theme key on invitation object (types)
- Extend `Invitation` type + ensure admin/editor queries that build the invitation pass theme key through.

### Task 10: Wire admin theme manager + public gallery preview (best effort)
- Add `key` field to admin CRUD; map public gallery "Buat Sendiri"/preview to registry where cheap.

### Task 11: Verify
- `npm run lint`, `npm run build`, manual browser check that picking each theme on a published invitation renders distinct styles.
