# Navigation & Account Pages Redesign

## Overview

Redesign the header navigation to eliminate the inconsistent mix of text links and icon-only dropdowns, and add a shared sidebar layout with fluent animations to the account pages (`/account`, `/account/shares`, `/account/reverseShares`).

## 1. Header Navigation

### Current State

The authenticated nav has: Logo + App Name | "Upload" text link | Link icon dropdown (Shares, Reverse Shares) | Avatar icon dropdown (Account, Admin, Sign Out) | Language `<Select>` | Theme toggle icon | Burger (mobile)

Problems: "Upload" is a text link while Shares and Account are hidden behind two separate icon-only dropdowns. The language `<Select>` takes significant horizontal space. Inconsistent interaction patterns.

### New Layout

**Left side:** Logo + App Name (link to home)

**Right side (left to right):**
1. **Upload CTA button** — filled/default variant Button with "Upload" label. Uses existing `t("navbar.upload")` translation. Visible for authenticated users (and unauthenticated when `share.allowUnauthenticatedShares` is true).
2. **Theme toggle** — existing `ActionIcon` with sun/moon icon. No changes.
3. **Language badge** — compact clickable element showing the current locale code (e.g. "EN", "DE"). On click, opens a Menu dropdown with the full list of languages. Replaces the current `<Select>` component. Styled as a small bordered badge (~28px height).
4. **Avatar dropdown** — existing `Avatar` ActionIcon. Dropdown restructured with sections:
   - **Top section:** "My Shares" (link icon), "Reverse Shares" (arrow-loop icon)
   - **Divider**
   - **Middle section:** "Account" (user icon), "Admin" (settings icon, admin-only)
   - **Divider**
   - **Bottom section:** "Sign Out" (door-exit icon)

### Components Changed

- **`Header.tsx`**: Remove `NavbarShareMenu` component from `authenticatedLinks`. Change Upload from a plain link to a `Button` component. Replace `LanguageSelect` with a new `LanguageBadge` component. Move language badge and theme toggle out of the right-side group and into the main links area (desktop), or keep in the utility group depending on spacing.
- **`NavbarShareMenu.tsx`**: Delete this component entirely.
- **`ActionAvatar.tsx`**: Add "My Shares" and "Reverse Shares" menu items at the top with a divider separating them from Account/Admin/Sign Out.
- **New: `LanguageBadge` component** (inline in Header or small separate file): Renders a `Menu` with the avatar as trigger showing locale code. Menu.Dropdown contains the language list as `Menu.Item` elements. On click sets the language cookie and reloads.

### Mobile

The burger menu continues to work. Items stack vertically in the dropdown Paper. Upload button renders as a full-width link. Theme toggle and language badge appear as items in the mobile menu.

### Unauthenticated Nav

- Home link (if `general.showHomePage`)
- Upload button (if `share.allowUnauthenticatedShares`) — same CTA button style
- Sign In link
- Sign Up link (if `share.allowRegistration`)
- Theme toggle and language badge remain in the utility area

## 2. Account Pages — Shared Sidebar Layout

### New Component: `AccountLayout`

A layout wrapper used by all three account pages. Two-column layout:

- **Left sidebar (~180px fixed width):** Vertical stack of navigation links:
  - "Account" → `/account`
  - "My Shares" → `/account/shares`
  - "Reverse Shares" → `/account/reverseShares`
- **Right content area:** Renders `children` with transition animations.

**Active state:** The link matching `router.pathname` gets:
- A 2px left border in the printstream color palette (`theme.colors.printstream[4]` or similar)
- Background: subtle surface highlight (`theme.colors.dark[5]` in dark mode, `theme.colors.gray[0]` in light mode)

**Hover state:** Links get a background transition (~150ms ease) to a slightly lighter shade.

**Mobile (<sm breakpoint):** Sidebar collapses into a horizontal row of links displayed above the content area. Same active/hover states but horizontal.

### Integration

Each account page (`/account/index.tsx`, `/account/shares.tsx`, `/account/reverseShares.tsx`) wraps its content in `<AccountLayout>`. The page title ("Account", "My Shares", "Reverse Shares") is rendered inside the content area, not in the sidebar.

File location: `frontend/src/components/account/AccountLayout.tsx`

## 3. My Shares — Stacked Row List

### Current State

Plain `<Table>` with columns: ID, Name, Visitors, Expires At, Actions.

### New Layout

Replace the table with a vertical stack of row cards. Each row is a `Paper` or `Box` with `withBorder`:

**Row structure (flexbox, space-between):**
- **Left group:**
  - Share name (`Text` weight 600, sm size)
  - Below: Share ID + lock icon if password-protected (`Text` color dimmed, xs size)
- **Center group (flex, gap):**
  - Views: count number (weight 500) with "views" label below (xs, uppercase, dimmed)
  - Expires: date or "Never" (weight 500) with "expires" label below (xs, uppercase, dimmed)
- **Right group:** Action icons in a `Group` — Edit (orange), Info (blue), Copy Link (printstream), Delete (red). Same `ActionIcon` components, same functionality.

### Reverse Shares — Same Row Pattern

Each reverse share row:
- **Left:** Share count text (e.g. "3 shares"). The existing accordion expand behavior stays — clicking the count expands inline to show linked share IDs with copy-link buttons.
- **Center:** Remaining uses, Max size, Expiration
- **Right:** Copy link + Delete action icons

## 4. Animations

All animations use CSS `@keyframes` and `transition` properties — no additional animation libraries needed.

### 4.1 Staggered Row Entrance

On page load, share rows animate in sequentially:
- **Animation:** `fadeSlideUp` — opacity 0→1, translateY(10px)→0
- **Duration:** 300ms per row
- **Delay:** 50ms × row index (first row: 0ms, second: 50ms, third: 100ms, etc.)
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (standard Material ease)

```css
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

Applied per row via inline style: `animation: fadeSlideUp 300ms cubic-bezier(0.4,0,0.2,1) forwards; animation-delay: ${index * 50}ms; opacity: 0;`

### 4.2 Row Hover

- Left border appears: `border-left: 2px solid` using printstream color
- Background shifts: transition to surface hover color
- `transition: all 150ms ease`

### 4.3 Page Transition (Content Area)

When navigating between account pages, the content area fades and slides:
- **Fade:** opacity 0→1, 200ms
- **Slide:** translateY(8px)→0, 200ms
- Triggered by route change using a key on the content wrapper tied to `router.pathname`

Implementation: Wrap content in a `div` with key={router.pathname} and apply the `fadeSlideUp` animation (reuse the same keyframes with shorter translateY).

### 4.4 Delete Row Animation

When a share is deleted:
1. Row fades out: opacity 1→0, 200ms
2. Row collapses: height auto→0, overflow hidden, 200ms
3. After animation completes, remove from state

Implementation: Track a `deletingId` state. When delete is confirmed, set `deletingId`, apply exit animation class, then after 400ms remove from array and clear `deletingId`.

## 5. Files to Create/Modify

### New Files
- `frontend/src/components/account/AccountLayout.tsx` — shared sidebar layout

### Modified Files
- `frontend/src/components/header/Header.tsx` — restructure nav, add LanguageBadge, Upload as Button
- `frontend/src/components/header/ActionAvatar.tsx` — add Shares/Reverse Shares items to dropdown
- `frontend/src/pages/account/index.tsx` — wrap in AccountLayout
- `frontend/src/pages/account/shares.tsx` — wrap in AccountLayout, replace Table with row list + animations
- `frontend/src/pages/account/reverseShares.tsx` — wrap in AccountLayout, replace Table with row list + animations

### Deleted Files
- `frontend/src/components/header/NavbarShareMenu.tsx` — no longer needed

## 6. Acceptance Criteria

1. Authenticated nav shows: Logo | Upload button | Theme toggle | Language badge | Avatar dropdown
2. Avatar dropdown contains: My Shares, Reverse Shares, divider, Account, Admin (if admin), divider, Sign Out
3. Language badge shows current locale code and opens a menu to switch languages
4. All three account pages share a left sidebar navigation with active state indicator
5. Sidebar collapses to horizontal links on mobile
6. My Shares page shows stacked row cards instead of a table
7. Reverse Shares page shows stacked row cards instead of a table
8. Rows stagger-animate in on page load
9. Rows have hover effect (left border + background shift)
10. Content area transitions with fade+slide when navigating between account pages
11. Delete animation fades out and collapses the row
12. No new dependencies added — CSS animations only
13. All existing functionality preserved (edit, info, copy link, delete, accordion expand for reverse shares)
