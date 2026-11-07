---
version: alpha
name: Excalibur Desktop
description: Quiet, rounded, human interface for configuring Excalibur. One accent, flat surfaces, hairlines instead of shadows.
colors:
  primary: "#6d4aff"
  primary-pressed: "#5a3ae0"
  on-primary: "#ffffff"
  canvas: "#f7f6f4"
  panel: "#ffffff"
  panel-2: "#efeeeb"
  hairline: "#e3e1dc"
  ink: "#1c1c1e"
  muted: "#6e6e73"
  ok: "#2f8f5b"
  warn: "#b7791f"
  primary-dark: "#8b7bff"
  primary-pressed-dark: "#a095ff"
  on-primary-dark: "#14121f"
  canvas-dark: "#121214"
  panel-dark: "#1a1a1d"
  panel-2-dark: "#232327"
  hairline-dark: "#2e2e33"
  ink-dark: "#f2f2f3"
  muted-dark: "#9a9aa2"
  ok-dark: "#5cc08a"
  warn-dark: "#e0b04a"
typography:
  display:
    fontFamily: system-ui
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.02em
  title:
    fontFamily: system-ui
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.015em
  body:
    fontFamily: system-ui
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: -0.006em
  body-strong:
    fontFamily: system-ui
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: -0.006em
  caption:
    fontFamily: system-ui
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0em
  code:
    fontFamily: ui-monospace
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: 8px
  md: 12px
  lg: 16px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.full}"
    height: 36px
    padding: 16px
  button-primary-pressed:
    backgroundColor: "{colors.primary-pressed}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.full}"
    height: 36px
    padding: 16px
  card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 24px
  input:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    height: 36px
    padding: 12px
  sidebar-item:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    height: 32px
    padding: 8px
  sidebar-item-active:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.ink}"
---

# Excalibur Desktop

## Overview

The app is opened rarely and used to configure, not to work in. It should feel calm and unhurried, never like a dashboard. The interface recedes; content and state are what you read.

This system is **our own**. Its discipline comes from studying brand systems extracted on getdesign.md, mainly Apple (one interactive color, flat tiles, hairlines, pill actions, tight tracking, a press state) and, for warmth, Claude (non-pure-white canvas, color used sparingly). It reuses no brand's values, fonts or assets.

Both a light and a dark theme exist. Dark tokens carry the `-dark` suffix and follow the system setting.

## Colors

- **primary** is the only interactive color: primary buttons, links, focus ring, selected state. Never a second accent.
- **canvas** is the window background and never pure white or pure black. **panel** is a raised surface (cards, dialogs, inputs). **panel-2** is the quiet fill for hover and the active sidebar item.
- **hairline** separates surfaces. It replaces shadows.
- **ink** is primary text and **muted** is secondary text. Do not invent a third tone.
- **ok** and **warn** are status colors only: a dot, a badge, a small icon. They never fill a large area.
- Contrast: `ink` on `canvas` and `on-primary` on `primary` meet WCAG AA in both themes.

## Typography

System UI fonts (San Francisco on macOS, Segoe UI on Windows): no font is bundled, so the app feels native and nothing needs licensing. Weights are 400 and 600 only; 500 is not used. Headlines carry slight negative tracking. Body is 14px because this is a desktop app, not a page. Code and paths use the system monospace at 13px.

## Layout

An 8px base with the scale in `spacing`. One column of content on the right of a fixed sidebar; the sidebar lists the project hub and the user profile, and everything else opens as a dialog. Page padding is 32px, card padding 24px, and gaps between related items 8 to 12px.

## Elevation & Depth

Flat. Surfaces are told apart by color and a 1px hairline, not by shadow. The only exception is a dialog over its backdrop, which may use a soft, wide shadow at low opacity so it reads as detached.

## Shapes

Round and friendly, matching the Solar icons. Actions and inputs are pills (`full`). Cards and dialogs use `lg` (16px). Small controls such as sidebar items use `md` (12px). Do not mix radii outside this scale.

## Components

- **Buttons** are pills, 36px tall. Primary is filled with `primary`; secondary is a `panel` pill with a hairline. On press, scale to 0.97 and use `primary-pressed`. Focus shows a 2px `primary` ring offset by 2px.
- **Cards** are `panel` with a hairline and 24px padding. No shadow.
- **Inputs** are pills with a hairline; focus replaces the hairline with the accent ring.
- **Sidebar items** are 32px tall with `md` radius. The active item uses `panel-2`.
- **Icons** are Solar Linear, 16px in the sidebar and controls and 20px in empty states, in `currentColor`. They come only from `src/renderer/shared/ui/icons.tsx`. Solar is CC BY 4.0, so the app needs a credits entry for it.
- **Status** is a small dot or badge, never a banner, unless an action would change files (then a short plain-language warning).

## Do's and Don'ts

**Do**
- Use `primary` for every interactive element and nothing else.
- Keep surfaces flat and separate them with hairlines.
- Use pills for actions and inputs.
- Write UI text in Portuguese, short and plain.
- Keep the press state (scale 0.97) on every button.

**Don't**
- Add a second accent color or decorative gradients.
- Put shadows on cards, buttons or text.
- Use weight 500, pure white or pure black backgrounds.
- Fill large areas with `ok` or `warn`.
- Copy values, fonts or assets from another brand's design system.
