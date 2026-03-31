# Design System Specification: High-Tech Fluidity

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Alchemist."** In an industry as physical and mundane as laundry management, this system seeks to transmute data into a liquid, high-tech experience. 

We are moving away from the "grid-of-boxes" utility look. Instead, we embrace **Intentional Fluidity**. This system breaks the template through the use of wide-set typography, asymmetrical component placement, and deep, layered translucency. The interface should feel less like a static website and more like a high-end automotive heads-up display—breathable, glowing, and undeniably premium.

---

## 2. Color Theory & Tonal Depth
The palette is built on a foundation of absolute darkness, allowing the neon accents to "vibrate" with energy.

### The Palette
- **Primary (`#8ff5ff`)**: Our "Electric Cyan." Reserved for high-action touchpoints and critical status indicators.
- **Secondary (`#10d5ff`)**: A deeper transition blue used for gradients to provide "soul" to flat surfaces.
- **Surface Tiers**: We use `surface-container-lowest` (#000000) for the base and `surface-container-highest` (#262626) for floating elements.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. 
Boundaries must be defined purely through background shifts. For example, a `surface-container-low` (#131313) card should sit on a `surface` (#0e0e0e) background. If a container feels lost, increase its elevation tier or use a backdrop blur—never a stroke.

### The Glass & Gradient Rule
To achieve the "catchy" high-tech vibe, utilize **Glassmorphism**. Floating panels should use semi-transparent surface colors with a `backdrop-filter: blur(20px)`. 
- **Signature Gradient:** Transition from `primary` (#8ff5ff) to `secondary` (#10d5ff) at a 135-degree angle for primary CTAs. This prevents the "flat" look of standard Material systems.

---

## 3. Typography: Editorial Authority
We utilize **Plus Jakarta Sans** for its geometric clarity and modern "ink traps" that feel high-tech yet legible.

- **Display (LG/MD):** Use `display-lg` (3.5rem) for hero stats (e.g., "Active Loads"). These should be Bold (700) with a slight negative letter-spacing (-0.02em) to create an editorial, high-fashion look.
- **Headline & Title:** These are the anchors. Use `headline-sm` (1.5rem) for section headers. Always pair these with generous `spacing-8` (2.75rem) to let the content breathe.
- **Body & Labels:** `body-md` (0.875rem) is the workhorse. For labels, use `label-md` (0.75rem) in All Caps with +0.05em letter spacing to provide a "technical manual" aesthetic.

---

## 4. Elevation & Depth: The Layering Principle
Depth is achieved through **Tonal Layering**, not structural lines.

- **The Stacking Rule:** Treat the UI as physical sheets of tinted glass. 
    - Level 0: `background` (#0e0e0e)
    - Level 1: `surface-container-low` (#131313) - Large content areas.
    - Level 2: `surface-container-high` (#1f1f1f) - Individual interactive cards.
- **Ambient Shadows:** Shadows must be invisible until noticed. Use `0px 20px 40px` blurs at 6% opacity using a tinted shadow color derived from `primary`. 
- **The "Ghost Border" Fallback:** If accessibility requires a container definition, use `outline-variant` (#484848) at **15% opacity**. It should feel like a suggestion of an edge, not a wall.

---

## 5. Components & Interface Patterns

### Buttons
- **Primary:** Gradient fill (`primary` to `secondary`). `xl` roundedness (1.5rem). High-gloss finish.
- **Secondary:** Glass-fill. `surface-container-highest` at 40% opacity with a `backdrop-filter`.
- **States:** On hover, the `primary-container` (#00eefc) should "glow" using a soft outer shadow of the same color.

### Input Fields
- **Style:** No bottom line. Use `surface-container-highest` as a subtle block fill.
- **Focus State:** The "Ghost Border" becomes 100% opaque `primary`, and the label shifts to `primary_dim`.

### Cards & Lists (The Laundry Feed)
- **Forbid Dividers:** Do not use lines between list items. Use `spacing-3` (1rem) of vertical white space or alternating `surface-container` shifts.
- **Status Chips:** Use `secondary_container` with `on_secondary_container` text. These must be `full` rounded (pills) to contrast the `xl` roundedness of the cards.

### Custom App Components
- **The "Machine Pulse":** An animated glow ring using `primary` that pulses around active machine icons, utilizing the glassmorphism backdrop-blur to soften the light.
- **The Fabric Gauge:** A custom progress bar using a `primary` to `tertiary` gradient, housed in a `surface-container-lowest` track for maximum contrast.

---

## 6. Do's and Don'ts

### Do:
- **Use Asymmetry:** Place high-level stats off-center to create a dynamic, modern layout.
- **Embrace Negative Space:** If a screen feels "empty," it’s likely working. Avoid the urge to fill every pixel.
- **Layer Glass:** Stack a glass tooltip over a glass card to create a sense of extreme high-tech depth.

### Don’t:
- **Don't use #000000 for everything:** Pure black is for the "void" (background). Use `surface-dim` for content areas to avoid "smearing" on OLED screens.
- **Don't use 100% Opaque Borders:** This kills the premium feel instantly. Stick to tonal shifts.
- **Don't use standard icons:** Use "Light" or "Thin" weight iconography to match the sophisticated stroke of Plus Jakarta Sans.