---
name: kickaway.win Control Deck
description: Dark-first streamer control panel with electric Kick green reserved for live moments, draws, and primary CTAs.
colors:
  kick-signal: "#53FC18"
  kick-ink: "#0B0B0C"
  canvas-dark: "#0F0F10"
  surface-dark: "#171717"
  surface-raised: "#1C1C1E"
  ink-primary: "#F5F5F5"
  ink-muted: "#9AA0A6"
  border-subtle: "#2B2F33"
  destructive: "#EF4444"
  sidebar-dark: "#404040"
typography:
  display:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "normal"
  body:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: "normal"
  body-lg:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Geist Variable, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  card: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  panel: "24px"
components:
  button-kick:
    backgroundColor: "{colors.kick-signal}"
    textColor: "{colors.kick-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "48px"
  button-kick-hover:
    backgroundColor: "{colors.kick-signal}"
    textColor: "{colors.kick-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "48px"
  button-outline:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 12px"
    height: "32px"
  input-default:
    backgroundColor: "{colors.canvas-dark}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
    height: "48px"
  card-default:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.card}"
    padding: "24px"
  sidebar-item:
    backgroundColor: "transparent"
    textColor: "{colors.ink-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "8px"
    height: "32px"
  badge-live:
    backgroundColor: "{colors.kick-signal}"
    textColor: "{colors.kick-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
---

# Design System: kickaway.win Control Deck

## Overview

**Creative North Star: "The Control Deck"**

kickaway.win is a streamer's broadcast control panel first and a marketing page second. The UI reads like pro production software: dark canvas, compact controls, sidebar navigation, dense participant lists. Showtime energy arrives at the climax (draw overlay, confetti, wheel spin) while day-to-day operation stays scannable under live pressure.

The system builds on shadcn/ui + Tailwind v4 tokens in `globals.css`, with a dedicated `kick` color role and `button-kick` variant for channel connect and draw actions. Light mode exists but dark is the native streamer context (second monitor, dim room).

**Key Characteristics:**

- Dark-first tonal layering, not decorative shadows
- Geist Variable for sharp, modern legibility at small sizes
- Kick green (#53FC18) as electric signal, not wallpaper
- Compact shadcn components (h-8/h-9 controls, rounded-lg/2xl cards)
- Playful motion isolated to draw moments; utilitarian elsewhere
- Sidebar + inset layout for multi-panel giveaway workflow

## Colors

A near-black canvas with stepped neutral surfaces and one loud accent.

### Primary

- **Electric Signal** (#53FC18): Kick brand green for connect CTAs, draw triggers, live badges, and winner moments. Reads as "go live" energy. Never used as a page background or large fill.

### Neutral

- **Broadcast Canvas** (#0F0F10): Default dark background (`--background` in dark mode). Theater frame for lists and panels.
- **Panel Surface** (#171717): Cards, popovers, elevated panels (`--card`).
- **Raised Surface** (#1C1C1E): Inputs, subtle elevation steps (`--input`, accent tints).
- **Primary Ink** (#F5F5F5): Headings, labels, active nav (`--foreground`).
- **Metadata Ink** (#9AA0A6): Counts, descriptions, helper text (`--muted-foreground`). Darkened mix for WCAG on dark bg.
- **Quiet Border** (#2B2F33): Panel edges, input outlines (`--border`, ~6% white alpha in code).
- **Kick Ink** (#0B0B0C): Text on green buttons (`--kick-foreground`).

### Tertiary

- **Sidebar Rail** (#404040): Collapsible nav column (`--sidebar` in dark). Slightly lifted from canvas.

### Semantic

- **Destructive** (#EF4444): Reset, remove, error states (`--destructive`).

### Named Rules

**The Electric Signal Rule.** Kick green appears on ≤10% of any screen outside draw overlays. If green is everywhere, it stops meaning "live."

**The Muted Ink Rule.** Metadata text uses `--muted-foreground` with a darkened color-mix, never raw neutral-500 on near-black. Gray-on-dark that fails contrast is the fastest way to look AI-generated.

## Typography

**Display / Body / Label Font:** Geist Variable (`@fontsource-variable/geist`), mapped to `--font-sans`.

**Character:** Technical sans with tight tracking on headlines. Optimized for scanning lists and button rows at 14px, not editorial prose.

### Hierarchy

- **Display** (700, clamp 1.875–2.25rem, line-height 1.1): Landing page title (`ChannelLanding` h1). One per view.
- **Headline** (600, 1.125rem): Card titles, panel headers (`CardTitle`, sidebar sections).
- **Body** (400, 0.875rem / 1rem): Descriptions, form help, list metadata. Cap prose at ~65ch where long copy appears.
- **Label** (500, 0.875rem): Buttons, inputs, sidebar items. Heavier than body for scan speed.
- **Overline** (500, 0.875rem, uppercase, tracking-wide): Landing kicker only; not repeated per section.

### Named Rules

**The One Family Rule.** Geist carries display through label. No secondary display face; hierarchy is weight and size, not font pairing.

## Elevation

Tonal layering is the default. Depth comes from background → card → popover steps, 1px inset highlights (`before:shadow`), and border-alpha dividers. Cards use `shadow-xs/5` at most; popovers and toasts add slightly stronger shadow-lg/5. No floating glass panels, no dramatic drop shadows.

### Shadow Vocabulary

- **Hairline inset** (`0 1px black/4%` light, `0 -1px white/6%` dark): Resting buttons, inputs, cards. Structural, not decorative.
- **Popover lift** (`shadow-lg/5`): Dropdowns, combobox, toast stack. State response, not default chrome.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. Stronger shadow appears only on floating layers (popover, toast, sheet).

## Components

### Buttons

- **Shape:** `rounded-lg` (10px base radius), compact heights h-7 through h-12 by size prop.
- **Kick primary:** `variant="kick"` — bg-kick, text-kick-foreground, hover/pressed at 90%/80% opacity. Used for Connect, Start draw, key giveaway actions.
- **Default / outline / ghost:** shadcn neutral variants for secondary actions. Outline uses border-input + bg-popover; ghost for toolbar icon buttons.
- **Focus:** `ring-2 ring-ring ring-offset-1`. No glow halos.

### Inputs

- **Style:** `rounded-lg`, border-input, bg-background (dark: bg-input/32), h-9 default / h-12 for `size="2xl"` landing input.
- **Focus:** border-ring + ring-[3px] ring-ring/24. Invalid states use destructive border/ring tints.

### Cards

- **Corner Style:** `rounded-2xl` (16px) with inset hairline shadow.
- **Background:** bg-card on canvas; 24px header/content padding (`p-6`).
- **Border:** 1px border default. No nested card stacks.

### Navigation (Sidebar)

- **Width:** 16rem expanded, 3rem icon-collapsed.
- **Items:** rounded-lg, h-8 rows, active state via bg-sidebar-accent + font-medium.
- **Mobile:** Sheet drawer at 18rem.

### Draw Overlay (signature)

- **Role:** Full-screen `<dialog>` for wheel/slot animation during winner selection.
- **Treatment:** Motion-heavy (motion library), confetti on finalize. Must respect `prefers-reduced-motion` (globals.css zeroes durations).
- **Separation:** Only surface where choreographed animation is expected.

### Chips / Badges

- Live/status badges use kick-signal fill. Filter chips use bg-accent rounded-md, compact padding.

## Do's and Don'ts

### Do:

- **Do** keep the interface dark-first; streamers use this beside OBS in dim environments.
- **Do** reserve #53FC18 for live status, primary CTAs, and draw climax moments.
- **Do** use Geist at 14px for dense lists (participants, winners) with label-weight buttons.
- **Do** use tonal surface steps and hairline borders before reaching for shadow.
- **Do** isolate playful motion to draw overlay and confetti; keep settings panels static.

### Don't:

- **Don't** use generic SaaS landing patterns: cream backgrounds, purple gradients, hero metrics, identical icon-card grids.
- **Don't** mimic Twitch-clone purple-heavy streaming tool aesthetics.
- **Don't** use overdesigned UI: glassmorphism, gradient text, excessive decorative motion.
- **Don't** put Kick green on large background fills or every button; it is signal, not theme paint.
- **Don't** add uppercase eyebrow kickers above every section; one landing overline is enough.
- **Don't** use side-stripe colored borders on list items or alerts.
- **Don't** nest cards inside cards for participants/winners panels.
