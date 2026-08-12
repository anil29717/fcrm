---
name: FreelancePro Operational System
colors:
  surface: '#f7faf7'
  surface-dim: '#d7dbd8'
  surface-bright: '#f7faf7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f1'
  surface-container: '#ebefec'
  surface-container-high: '#e5e9e6'
  surface-container-highest: '#e0e3e0'
  on-surface: '#181c1b'
  on-surface-variant: '#3e4945'
  inverse-surface: '#2d3130'
  inverse-on-surface: '#eef2ee'
  outline: '#6f7975'
  outline-variant: '#bec9c4'
  surface-tint: '#066b59'
  primary: '#005445'
  on-primary: '#ffffff'
  primary-container: '#0e6e5c'
  on-primary-container: '#9bedd6'
  inverse-primary: '#84d6c0'
  secondary: '#47645c'
  on-secondary: '#ffffff'
  secondary-container: '#c9eade'
  on-secondary-container: '#4d6a61'
  tertiary: '#773729'
  on-tertiary: '#ffffff'
  tertiary-container: '#944e3e'
  on-tertiary-container: '#ffd4cb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a0f2db'
  primary-fixed-dim: '#84d6c0'
  on-primary-fixed: '#002019'
  on-primary-fixed-variant: '#005143'
  secondary-fixed: '#c9eade'
  secondary-fixed-dim: '#adcdc3'
  on-secondary-fixed: '#02201a'
  on-secondary-fixed-variant: '#2f4c44'
  tertiary-fixed: '#ffdad2'
  tertiary-fixed-dim: '#ffb4a3'
  on-tertiary-fixed: '#3a0a02'
  on-tertiary-fixed-variant: '#733426'
  background: '#f7faf7'
  on-background: '#181c1b'
  surface-variant: '#e0e3e0'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
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
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 20px
  card-gap: 16px
  section-margin: 32px
  nav-height: 64px
---

## Brand & Style
The design system is engineered for the modern independent professional. It prioritizes clarity, efficiency, and a sense of calm productivity. The style is **Corporate / Modern** with a focus on functional minimalism. It utilizes a card-based architecture to organize disparate data points—invoices, client details, and project timelines—into digestible, actionable units. The interface avoids unnecessary decoration, relying instead on precise alignment, generous whitespace, and a sophisticated teal-green accent to convey reliability and growth.

## Colors
The palette is anchored by a professional Teal-green primary color, used for key actions and brand presence. The background uses a cool, off-white grey to reduce eye strain during long working sessions. 

Status colors are strictly functional:
- **Completed:** Green (#10B981) signals success and finality.
- **In-Progress:** Amber (#F59E0B) indicates active attention required.
- **Pending:** Blue (#3B82F6) denotes awaiting external feedback or scheduling.

Borders are kept extremely subtle at 0.5px to define boundaries without adding visual clutter.

## Typography
This design system uses **Inter** for its exceptional legibility in data-heavy environments. The typographic scale emphasizes a clear hierarchy:
- **Display and Headlines** use tighter letter-spacing and heavier weights to anchor pages.
- **Body Text** maintains standard tracking for readability in long-form project descriptions.
- **Labels** often use uppercase styling with increased letter-spacing to differentiate metadata from primary content.

## Layout & Spacing
The system employs a **Fluid Grid** with fixed maximum widths for desktop viewing to ensure line lengths remain readable. 

- **Mobile:** A single-column layout with 20px side margins.
- **Tablet:** A 2-column masonry or grid layout for cards.
- **Desktop:** A 12-column grid with cards spanning 3, 4, or 6 columns depending on content density.

Spacing follows a 4px baseline rhythm. Every element's margin and padding should be a multiple of this unit to maintain mathematical harmony across the dashboard.

## Elevation & Depth
The system uses **Tonal Layers** and **Low-Contrast Outlines** instead of heavy shadows. 
- **Surface:** The background sits at the lowest level (#F7F9FB).
- **Cards:** White (#FFFFFF) surfaces with a 0.5px border (#000000 at 8% opacity).
- **Elevated State:** Only used for active dropdowns or modals, featuring a very soft, diffused 15% opacity shadow with a 12px blur.
- **Interactive Elements:** Buttons and inputs use a subtle inset glow or 1px stroke rather than drop shadows to maintain a "flat but tactile" feel.

## Shapes
The shape language is defined by a consistent **12px (0.75rem)** corner radius for all primary containers and cards. This "Soft" approach balances professional rigor with an approachable, modern feel. 
- Small elements like checkboxes and mini-tags use a **4px** radius.
- Buttons and input fields mirror the **12px** card radius for visual consistency.
- Status pills use a fully rounded (pill) radius to distinguish them from interactive buttons.

## Components
### Buttons
- **Primary:** Solid #0E6E5C background with white text. 12px border radius.
- **Secondary:** Transparent background with a 1px border of #0E6E5C and teal text.

### Status Pills
Used for project and invoice states. These feature a light background (10% opacity of the status color) and bold foreground text of the full-strength color.

### Navigation (Fixed Bottom Bar)
A persistent 64px height bar at the bottom of the viewport. It features a background of white or a very high-alpha blur.
- **Destinations:** Dashboard, Clients, Projects, Invoices, Settings.
- **Active State:** The icon and label transition to the Primary Teal color with a subtle 2px top-indicator bar.

### Cards
The core container of the system. Every card must have a white background, a 12px border radius, and a 0.5px border. Padding inside cards is standardized at 20px.

### Input Fields
12px border radius with a 1px border (#E2E8F0). Focus state changes the border to #0E6E5C with a subtle 2px outer halo.