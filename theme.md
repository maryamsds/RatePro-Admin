🎨 UI / Theme Guidelines for Project (Final)

🎯 Primary Theme & Color Palette

Primary Color: #1fdae4 (hover: #17c1ca)

The theme should be modern, minimal, stylish, and elegant — avoid over-designed or heavy UI elements.

Light & Dark mode structures are already defined in :root variables.
✅ Use only these variables (no hard-coded colors).

Light Background: #f8f9fa

Dark Background: #1a1d23

Text Colors: --light-text (light mode), --dark-text (dark mode)

🌗 Proper Light & Dark Theme Handling (Important)

Maintain clear and readable color contrast in both themes.

Use light text on dark backgrounds and dark text on light backgrounds.

❌ Do not use hard-coded #fff or #000 — always use variables:

var(--light-bg) / var(--dark-bg)

var(--light-text) / var(--dark-text)

Ensure hover, focus, and active states are visibly distinct in both modes.

For borders and cards, use:

--light-border / --dark-border

--light-card / --dark-card

📱 Responsiveness (Mobile First)

Every page layout must be fully responsive.

Use Bootstrap 5.3 responsive classes like .container-fluid, .row, .col-*, .d-flex, .flex-wrap, etc.

Sidebar:

Collapsed width → --sidebar-collapsed-width (70px)

Expanded width → --sidebar-width (280px)

Fixed header height → --header-height (56px)

✨ UI Components Styling

Use Bootstrap components for all standard UI elements:
Buttons, Cards, Modals, Forms, Tables, Alerts, etc.

Border radius → --border-radius (8px)

Shadows:

Small elements → --shadow-sm

Cards & sections → --shadow-md

Transitions → --transition (smooth animations)

🧭 Layout & Spacing Rules

Maintain consistent padding and margins across the UI.

Use Grid or Flexbox structures appropriately.

Ensure balanced spacing between navigation and sidebar elements.

🅱 Using Bootstrap Classes

Prefer Bootstrap utility classes (btn, card, shadow, rounded, border, bg-*, text-*) instead of custom CSS whenever possible.

Use responsive breakpoints correctly: sm, md, lg, xl, xxl.

🧠 UX Priority

UI should be simple, clean, and intuitive.

Use the global font family from the root variable: --font-family.

No component should appear dull, hidden, or unclear in either mode (light or dark).

✅ Final Reminder for Designer

Test visual contrast for every page and component in both Light & Dark modes.

Make sure primary and background colors remain clearly readable together.

Perform responsive testing across all breakpoints — mobile → tablet → desktop.

✅ Final Reminder for Developer

Keep all CSS in App.css.

Avoid className conflicts — use consistent class names throughout the project.

Reuse existing CSS classes where possible; create new classes only when necessary.

Ensure CSS is optimized, clean, and maintainable.