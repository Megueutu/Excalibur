---
version: alpha
name: Excalibur Desktop
description: Calm, borderless, minimal desktop interface. Built on the Apple design system as extracted on getdesign.md (one blue, flat tones, pill actions, tight tracking), adapted for a dense desktop app.
colors:
  primary: "#0066cc"
  primary-pressed: "#0071e3"
  on-primary: "#ffffff"
  canvas: "#ffffff"
  panel: "#f5f5f7"
  panel-2: "#e8e8ed"
  ink: "#1d1d1f"
  muted: "#6e6e73"
  ok: "#248a3d"
  warn: "#b25000"
  primary-dark: "#0071e3"
  primary-pressed-dark: "#0a84ff"
  on-primary-dark: "#ffffff"
  canvas-dark: "#161617"
  panel-dark: "#272729"
  panel-2-dark: "#333336"
  ink-dark: "#f5f5f7"
  muted-dark: "#a1a1a6"
  ok-dark: "#30d158"
  warn-dark: "#ff9f0a"
typography:
  display:
    fontFamily: system-ui
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.14
    letterSpacing: -0.02em
  title:
    fontFamily: system-ui
    fontSize: 17px
    fontWeight: 600
    lineHeight: 1.24
    letterSpacing: -0.022em
  body:
    fontFamily: system-ui
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.47
    letterSpacing: -0.016em
  body-strong:
    fontFamily: system-ui
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.47
    letterSpacing: -0.016em
  caption:
    fontFamily: system-ui
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: -0.01em
  code:
    fontFamily: ui-monospace
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: 8px
  md: 11px
  lg: 18px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  page: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.full}"
    height: 36px
    padding: 20px
  button-primary-pressed:
    backgroundColor: "{colors.primary-pressed}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.full}"
    height: 36px
    padding: 20px
  card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 20px
  sidebar-item:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    height: 36px
    padding: 12px
  sidebar-item-active:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.ink}"
  badge:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: 10px
---

# Excalibur Desktop

## Overview

The app is opened rarely and used to configure, not to work in. It should feel calm and unhurried, never like a dashboard: borderless, flat, with content and state doing the talking.

The system takes the Apple design system as extracted on getdesign.md (`design-md/apple`, MIT) as its base: its palette, radii, tracking, pill actions, press state and rule of one interactive color. What changes for a desktop app: a 14px body instead of 17px, no photography tiles, no full-bleed bands, and the system font stack instead of a bundled SF Pro. Because these are a real brand's values, the app's final identity (name, mark, color) is still to be decided before any public release.

Both a light and a dark theme exist. Dark tokens carry the `-dark` suffix and follow the system setting.

## Colors

- **primary** is the only interactive color: primary buttons, focus ring, links. Never a second accent.
- **canvas** is the content area. **panel** is the frame (title bar and sidebar) and every raised group inside the content (cards, grouped lists, code blocks). **panel-2** is hover, the active sidebar item and badges.
- Separation is by tone only: canvas vs panel vs panel-2. There are **no borders and no dividers**.
- **ink** is primary text and **muted** is secondary text; there is no third tone.
- **ok** and **warn** are status colors only: a dot or a small label, never a filled area.

## Typography

System UI fonts (San Francisco on macOS, Segoe UI Variable on Windows). Weights are 400 and 600 only. Headings carry negative tracking. Page titles use `display`, group and dialog titles use `title`, everything else `body` or `caption`. Section labels are `caption` in muted, sentence case, never uppercase.

## Layout

An 8px base. Page padding is `page` (32px) on every side; the gap between sections is 32px and between a section label and its content 8px. Groups (`card`) have 20px padding, rows inside a group 12px vertical and 16px horizontal. The frame (title bar plus sidebar) sits on `panel` and the content area is a `canvas` sheet with an `lg` radius at its top-left corner. Sidebar width is 250px, its padding 12px, items 36px tall with 2px between them, and section labels 24px above the first item.

Nothing touches an edge: text always has at least 12px to the nearest edge of its container, and controls at least 8px from each other.

## Elevation & Depth

Flat. Depth comes only from the tone steps above. The one exception is a dialog over its backdrop, which uses a wide, soft shadow at low opacity so it reads as detached.

## Shapes

Actions, badges and inputs are pills (`full`). Cards, grouped lists and dialogs use `lg` (18px). Sidebar items use `md` (11px), small inner controls `sm` (8px). Do not mix radii outside this scale.

## Components

- **Buttons** are pills, 36px tall, 20px horizontal padding. Primary is filled with `primary`, secondary is `panel` with no outline. On press scale to 0.95; hover shifts to `primary-pressed` or `panel-2`. Focus shows a 2px `primary` ring offset by 2px.
- **Cards and grouped lists** are `panel` with `lg` radius. Rows inside are separated by space, not lines.
- **Sidebar items** are 36px tall with `md` radius; active uses `panel-2`.
- **Badges** are small pills on `panel-2`, text in `muted`.
- **Icons** come from two single-color sets, both in `currentColor`: Solar Linear for the interface, drawn at stroke width 2 for a sturdier line (CC BY 4.0, so the app needs a credits entry), and Simple Icons for git, GitHub and the stack (CC0, solid, with a light round outline so they sit closer to the line icons). Interface icons are 16px in the sidebar and controls, 20px in cards; brand icons match. They are generated by `npm run icons` and used only through `shared/ui/icons.tsx` and `shared/ui/repo-icons.tsx`.
- **Repository kind** has one symbol each: GitHub (git with a GitHub remote), Git (local, no remote) and a plain folder. A repository row always shows its kind first, then its main stack icon, then its name.
- **Stack icons** come from detectors, not from hand-picked lists: `linguist-js` for the language and `@specfy/stack-analyser` for frameworks and tools, each mapped to a Simple Icons slug. A technology without an icon is skipped, never replaced by a colored logo.
- **Fixed tabs** sit together at the top of the sidebar: Início, Perfil do usuário, Configurações. Projects and standalone repositories follow below.
- **Visual first:** pages show state as cards with an icon and one short line, not as tables. Projects and repositories are cards; configuration is a row of badges.
- **Status** is a small dot, never a banner, unless an action would change files (then a short plain-language note in a card).

## Do's and Don'ts

**Do**
- Use `primary` for every interactive element and nothing else.
- Separate with tone and space; keep surfaces flat.
- Use pills for actions and `lg` for groups.
- Write UI text in Portuguese, short and plain.
- Keep the press state on every button.

**Don't**
- Add borders, dividers, outlines or a second accent color.
- Put shadows on cards, buttons or text (dialog excepted).
- Use weight 500, uppercase labels or decorative gradients.
- Fill large areas with `ok` or `warn`.
- Let text or controls touch an edge or each other.
