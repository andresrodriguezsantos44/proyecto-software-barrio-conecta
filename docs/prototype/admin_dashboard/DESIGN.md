---
name: Vital Neighborhood
colors:
  surface: '#f4fcf0'
  surface-dim: '#d5dcd1'
  surface-bright: '#f4fcf0'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff6ea'
  surface-container: '#e9f0e5'
  surface-container-high: '#e3eadf'
  surface-container-highest: '#dde5d9'
  on-surface: '#171d16'
  on-surface-variant: '#3e4a3d'
  inverse-surface: '#2b322b'
  inverse-on-surface: '#ecf3e7'
  outline: '#6e7b6c'
  outline-variant: '#bdcaba'
  surface-tint: '#006e2d'
  primary: '#006b2c'
  on-primary: '#ffffff'
  primary-container: '#00873a'
  on-primary-container: '#f7fff2'
  inverse-primary: '#62df7d'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#a72d51'
  on-tertiary: '#ffffff'
  tertiary-container: '#c74668'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#7ffc97'
  primary-fixed-dim: '#62df7d'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005320'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#ffd9de'
  tertiary-fixed-dim: '#ffb2bf'
  on-tertiary-fixed: '#3f0016'
  on-tertiary-fixed-variant: '#8a143c'
  background: '#f4fcf0'
  on-background: '#171d16'
  surface-variant: '#dde5d9'
typography:
  display-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.25'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 48px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The design system is rooted in the concept of "Digital Proximity." It prioritizes high legibility and approachable geometry to foster trust between local businesses and community members. The style is **Modern Corporate with a Humanist touch**, leaning into clean layouts that avoid clinical coldness through the use of soft elevation and organic roundedness. 

The aesthetic is characterized by:
- **Clarity over Complexity:** Every interface element has a clear purpose, utilizing ample whitespace to reduce cognitive load for users of all digital literacies.
- **Warm Professionalism:** The interface feels established and secure (trustworthy) while remaining inviting and neighborly (friendly).
- **Tactile Accessibility:** Interactive elements use subtle depth cues to indicate clickability, ensuring the digital directory feels as intuitive as a physical neighborhood stroll.

## Colors

This design system utilizes a palette inspired by growth and civic reliability. 

- **Primary (Emerald):** Represents vitality and local commerce. Used for main actions, success states, and brand presence.
- **Secondary (Blue):** Evokes trust and technology. Used for informational links, secondary actions, and verification badges.
- **Accent (Amber):** High-visibility color reserved for ratings, highlighted promotions, and urgent calls to action.
- **Neutral Scale:** The background uses a warm white to prevent eye strain, while the text hierarchy relies on high-contrast dark grays to ensure WCAG AA accessibility standards are met.

## Typography

The typography strategy pairs **Plus Jakarta Sans** for headings with **Inter** for functional text. 

- **Headings:** Use Plus Jakarta Sans to provide a friendly, modern character. Large titles are essential for establishing a clear information hierarchy in the directory.
- **Body & UI:** Inter is utilized for its exceptional legibility at small sizes, particularly within dense business cards and multi-step forms. 
- **Scale:** Maintain a generous type scale to ensure the directory remains accessible to a wide age demographic within the local community.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a 12-column structure for desktop and a single-column stack for mobile. 

- **Grid Logic:** Use a 1280px max-width container for desktop layouts to keep line lengths readable. 
- **Rhythm:** An 8px linear scale (with a 4px step for tight UI) governs all margins and padding. 
- **Contextual Spacing:** Business cards and dashboard widgets should utilize `md` (24px) padding to ensure content feels breathable and premium.

## Elevation & Depth

This design system uses **Ambient Shadows** to create a sense of layering without the harshness of traditional borders. 

- **Surface 0 (Background):** #F8FAFC. The canvas.
- **Surface 1 (Cards/Widgets):** Pure white (#FFFFFF) with a soft, diffused shadow. Use a 12% opacity tint of the secondary color for shadows to add warmth: `box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.05), 0 4px 6px -2px rgba(37, 99, 235, 0.03)`.
- **Surface 2 (Overlays/Popovers):** Higher elevation with a larger blur radius to indicate temporary focus.
- **Interactive Depth:** Buttons should have a slight "lift" on hover, achieved by increasing shadow spread and decreasing Y-offset to simulate the element moving toward the user.

## Shapes

The shape language is consistently **Rounded**, reinforcing the friendly and approachable brand personality.

- **Base Radius:** 8px (`0.5rem`) for standard inputs, small buttons, and tooltips.
- **Large Radius:** 16px (`1rem`) for business cards, dashboard widgets, and modal containers.
- **Extra Large Radius:** 24px (`1.5rem`) for search bars and large promotional banners.
- **Circular:** Reserved for user avatars and icon containers.

## Components

The components within this design system prioritize ease of use and visual consistency.

- **Navigation:** 
    - **Desktop:** A sticky top-nav with a blurred background (glassmorphism Lite) containing the search bar and profile.
    - **Mobile:** A fixed bottom-nav with large, labeled icons for "Home," "Categories," "My Neighborhood," and "Profile."
- **Business Cards:** Use Surface 1 elevation. Feature a prominent business image (top), followed by the business name in `headline-md`, a secondary-colored "Verified" badge, and an Amber rating star.
- **Search Bars:** Pill-shaped with a soft inner shadow or a thin #E2E8F0 border. Include a prominent Emerald search icon.
- **Buttons:** 
    - **Primary:** Emerald background, white text, 16px vertical padding for a "large, accessible" feel.
    - **Secondary:** White background, Emerald border, or Soft Blue for informational actions.
- **Multi-step Forms:** Use a horizontal progress stepper at the top. Each step should be encapsulated in a Large Radius white card to maintain focus.
- **Status Badges:** Small, pill-shaped labels with low-opacity backgrounds (e.g., a light emerald background for "Open" status with dark emerald text).
- **Dashboard Widgets:** Use a grid-based layout for business owners to see analytics like "Profile Views" and "Customer Inquiries," utilizing simple line charts in Secondary Blue.