---
name: Teal Utility System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3d4947'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#924628'
  on-tertiary: '#ffffff'
  tertiary-container: '#b05e3d'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb59a'
  on-tertiary-fixed: '#370e00'
  on-tertiary-fixed-variant: '#773215'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-bold:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  margin-safe: 16px
  gutter: 12px
---

## Brand & Style

This design system is built for business utility, focusing on speed of comprehension and operational efficiency. The brand personality is rooted in reliability and precision, aimed at professional users who require a tool that feels like a high-performance instrument rather than a social experience.

The visual style follows a **Modern Minimalist** approach. It prioritizes clarity through generous whitespace, a restricted color palette, and high-quality typography. The interface avoids decorative elements, ensuring that every visual mark serves a functional purpose. The goal is to evoke a sense of calm control in high-pressure business environments.

## Colors

The palette is anchored by a professional Teal (#0D9488), used sparingly for primary actions and brand presence to maintain its impact. 

- **Primary:** Teal is used for main "Call to Action" buttons, active states, and critical navigation.
- **Secondary:** A deep Slate (#0F172A) is used for high-emphasis text and headers to provide grounding.
- **Neutral:** Cool grays handle secondary text, borders, and disabled states.
- **Functional Colors:** Semantic colors for status indicators (Paid, Pending, Overdue) use standard accessible values. These should always be accompanied by a label or icon to ensure accessibility.
- **Surface:** The background is a very light "off-white" slate to reduce screen glare while maintaining a clean, paper-like feel.

## Typography

The design system utilizes **Inter**, a typeface designed specifically for screens and high-legibility UI. The type scale is optimized for mobile viewing, ensuring that hierarchical relationships are clear even on smaller devices.

- **Headlines:** Use a tighter letter spacing and heavier weight to create a strong visual anchor for sections.
- **Body:** Standardized at 16px for readability, dropping to 14px for secondary metadata.
- **Labels:** Small caps or bold weights are used for utility text (like "TOTAL" or "DUE DATE") to differentiate them from data values.
- **Mobile Adjustments:** Avoid font sizes smaller than 12px to maintain accessibility standards.

## Layout & Spacing

The layout follows a **Fluid Mobile Grid** philosophy. It uses a 4px baseline shift to ensure all elements align to a consistent vertical rhythm.

- **Safe Margins:** A standard 16px side margin is maintained across all screens to prevent content from touching device edges.
- **Grid model:** While mobile layouts are primarily single-column, card internals may use a 2-column or 4-column sub-grid for data points (e.g., Date | Amount).
- **Stacking:** Vertical spacing between cards is standardized at 12px or 16px to maintain a clear distinction between data objects without wasting excessive vertical space.

## Elevation & Depth

This design system uses **Tonal Layering** and **Soft Ambient Shadows** to define depth. The goal is to make the UI feel structured but flat enough to remain professional and unobtrusive.

- **Level 0 (Background):** The base slate-50 surface.
- **Level 1 (Cards):** White surfaces with a 1px soft border (#E2E8F0) and a subtle 4px blur shadow with 5% opacity. This makes the data units feel "lifted" and interactive.
- **Level 2 (Modals/Overlays):** Stronger shadows (12px blur, 10% opacity) to signify temporary interruption.
- **Interaction:** Upon press, cards should visually "sink" (shadow removed, slight scale down to 0.98) to provide tactile feedback.

## Shapes

The shape language is **Soft** and systematic. 

- **Standard Elements:** Buttons, input fields, and cards utilize a 0.25rem (4px) or 0.5rem (8px) radius. This provides a modern, approachable feel without looking overly "playful" or consumer-grade.
- **Status Pills:** Use fully rounded (pill-shaped) ends to differentiate status indicators from functional buttons.
- **Icons:** Use linear icons with a 2px stroke weight to match the clean, professional aesthetic of the typography.

## Components

### Buttons
- **Primary:** Solid Teal background with white text. High contrast, 48px minimum height for touch targets.
- **Secondary:** Transparent background with Teal border and text. Used for "Cancel" or "Edit" actions.

### Cards
- The primary container for information. Cards must have a white background, a light gray stroke, and include internal padding of 16px. Content within cards should follow a clear hierarchy: Title (Slate-900), Metadata (Slate-500), and Status (Color-coded).

### Status Indicators
- **Paid/Completed:** Green text on a light green tinted background.
- **Pending/In-Progress:** Amber text on a light amber tinted background.
- **Overdue/Error:** Red text on a light red tinted background.
- Indicators should always use a "Pill" shape to distinguish them from other UI elements.

### Input Fields
- Understated style: A light gray border that turns Teal on focus. Labels should be positioned above the field in the `label-md` style.

### Lists
- For high-density data, use clean list rows separated by 1px dividers rather than individual cards to maximize vertical screen real estate.