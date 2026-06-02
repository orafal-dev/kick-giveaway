---
version: alpha
name: Kick Neon Dark
description: A high-contrast dark streaming interface with a loud neon accent and compact, content-dense navigation.
colors:
  primary: "#53FC18"
  secondary: "#171A1C"
  tertiary: "#2A2D31"
  neutral: "#0B0B0C"
  surface: "#171A1C"
  on-surface: "#FFFFFF"
  error: "#FF4D4F"
  border: "#2B2F33"
  muted: "#9AA0A6"
typography:
  headline-display:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: 700
    lineHeight: 38px
    letterSpacing: 0px
  headline-lg:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: 700
    lineHeight: 31px
    letterSpacing: 0px
  headline-md:
    fontFamily: Inter
    fontSize: 21px
    fontWeight: 600
    lineHeight: 25px
    letterSpacing: 0px
  headline-sm:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: 0px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: 0px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 600
    lineHeight: 18px
    letterSpacing: 0px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 600
    lineHeight: 16px
    letterSpacing: 0px
  overline:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: 700
    lineHeight: 12px
    letterSpacing: 0.06em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0px
rounded:
  none: 0px
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  gutter: 24px
  section: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
    height: "40px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
    height: "40px"
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: "0px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "16px"
  input:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
    height: "40px"
  chip:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: "4px 8px"
  sidebar-item:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
  badge-live:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
---

# Kick Neon Dark

## Overview
Kick’s interface feels energetic, direct, and built for nonstop browsing and live participation. The dark canvas keeps attention on streams and chat, while the neon green accent injects urgency and brand recognition. Overall the experience is dense and utility-first, aimed at stream viewers who want fast discovery, strong hierarchy, and minimal visual friction.

## Colors
- **Primary (#53FC18):** A vivid neon green used for the most important actions, live indicators, and brand moments. It should feel electric and attention-grabbing, not decorative.
- **Secondary (#171A1C):** The main elevated surface color for panels, sidebars, cards, and overlays. It keeps the interface cohesive while separating content from the near-black background.
- **Tertiary (#2A2D31):** A muted slate used for chips, subtle controls, and low-emphasis containers. It supports hierarchy without competing with the primary accent.
- **Neutral (#0B0B0C):** The page background and deepest layer in the system. This near-black tone creates a theater-like frame around video and chat.
- **On-surface (#FFFFFF):** The default text and icon color on dark surfaces. White is used aggressively to preserve readability and visual contrast.
- **Border (#2B2F33):** A quiet divider color for input outlines, panels, and low-contrast boundaries. It prevents hard separations from feeling too heavy.
- **Muted (#9AA0A6):** A secondary text tone for metadata, labels, and supporting information. Use it for less important copy like counts and subtitles.
- **Error (#FF4D4F):** A cautionary accent for destructive states or status messaging when needed. It should remain rare in a system dominated by green and white.

## Typography
Inter is the system typeface across all UI, matching the product’s sharp, modern, highly legible feel. Headlines use bold to semi-bold weights to anchor dense content blocks, while body text stays regular for readability in chat, lists, and metadata. Labels and controls lean heavier than body copy so buttons, pills, and navigation remain easy to scan in a crowded layout.

The typography scale should stay compact: `headline-display` and `headline-lg` for major section headers, `headline-md` and `headline-sm` for cards and panels, and `body-md` / `body-sm` for supporting text. `label-md` and `label-lg` are the best fit for buttons, sidebar items, and category tags. Uppercase is not a dominant pattern, but `overline` may be used sparingly for micro-labels if tighter tracking is needed.

## Layout
The layout is dense and dashboard-like, with strong lateral structure: a left navigation rail, a central content stage, and a right chat column. Content blocks use fixed, card-based widths rather than a spacious editorial grid, which suits live video, chat, and browse-first discovery. Section spacing should follow a tight rhythm using 4px, 8px, 12px, 16px, and 20px increments, with larger section separation at 24px to 32px when switching between major areas.

Cards and panels should use 16px internal padding, while compact controls and chips stay closer to 6px to 12px padding. The overall composition favors high information density with minimal empty space, but still preserves clear gutters so media, lists, and chat do not collapse into one another.

## Elevation & Depth
Depth is subtle and mostly achieved through tonal layering rather than dramatic shadows. The UI relies on a very dark background, slightly lighter surfaces, and crisp borders to separate zones. Video containers and cards may use soft shadowing, but the system generally prefers flat, practical layering that keeps the interface fast and unembellished.

Use contrast and surface stepping to create hierarchy: background, surface, then controls and active states. The neon primary color should do the heavy lifting for emphasis instead of shadow-heavy treatments.

## Shapes
The shape language is restrained and functional, with small radii that keep the interface feeling sharp and modern. Most interactive elements use `rounded.sm` at 4px, while cards and larger containers can move to 6px or 8px for a slightly softer block presence. Pills and status chips should use full rounding to contrast with the otherwise squared-off layout.

Overall the system should feel architectural rather than playful: clipped corners, compact buttons, and minimal curvature.

## Components
Buttons are small, dense, and high-contrast. `button-primary` uses the neon green fill with dark text and a 40px height, making it the clear call to action for actions like Sign Up or Watch now. `button-secondary` is transparent with a white outline or text treatment for less dominant actions, and `button-tertiary` should remain text-only for lightweight links. Keep button padding compact at 6px 12px, and avoid oversized button chrome.

Inputs should be dark, bordered, and low-noise. The search field uses a dark surface with a subtle outline, 40px height, and compact horizontal padding so it blends into the top bar without stealing attention. Focus states can rely on brighter border contrast or primary-color emphasis, but should not introduce glow-heavy styling.

Cards use `card` as a dark surface container with 16px padding and modest 6px rounding. They should frame media and metadata cleanly, with image-first layouts and high-contrast text overlays when needed. Cards must stay visually subordinate to the video and the primary action button.

Chips and badges are important in this system because they communicate live status, language, and category quickly. `chip` should be pill-shaped, compact, and muted by default, while `badge-live` can adopt the primary green to signal urgency and presence. Sidebar items should feel like navigational rows rather than buttons, with a clear active state and enough padding for quick scanning.

Lists, chat rows, and category tiles should remain compact and rhythmical. Use icon-plus-label patterns, small avatar treatment, and tight vertical spacing so browse and chat can coexist without visual clutter.

## Do's and Don'ts
- Do keep the interface dark-first and let the neon green accent carry the brand energy.
- Do use Inter in bold, compact treatments for headings, navigation, and actions.
- Do preserve a dense, dashboard-like layout with clear but tight spacing.
- Do favor subtle surfaces and borders over dramatic shadows or glossy effects.
- Don't introduce large border radii or soft, playful shapes that weaken the sharp feel.
- Don't replace the primary green with multiple bright accent colors; keep the palette disciplined.
- Don't use roomy, airy spacing or oversized cards that reduce the sense of live content density.
- Don't make secondary actions compete with the primary CTA; they should remain quieter and more utilitarian.