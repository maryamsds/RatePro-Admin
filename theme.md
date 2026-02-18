🎨 UI / Theme Guidelines for Project (Tailwind v4 – Final)

This document defines the single source of truth for UI, theme, and styling decisions in this project.
All rules are global, strict, and non-negotiable.

Goal:
➡ Clean, modern, scalable, enterprise-ready SaaS UI
➡ Tailwind CSS v4 first, custom CSS only when required

🎯 1. Design Philosophy (Big Picture)

UI must be modern, minimal, clean, elegant

❌ No heavy, flashy, decorative, or over-styled UI

Consistency > creativity

UI should feel professional, calm, enterprise-grade

Less UI, more clarity

🧱 2. Global CSS Architecture (Mandatory)

Only one global CSS system is allowed.

✅ Allowed global CSS:

:root design tokens (colors, spacing, layout, transitions)

Minimal CSS reset

Global reusable animations

Dark mode variable overrides

❌ No component-specific or page-specific CSS

❌ No duplicate Tailwind behavior

Rule: Tailwind classes must be used wherever possible.
Custom CSS only if a Tailwind utility does not exist.

🎨 3. :root — Design Tokens (Single Source of Truth)

All colors, spacing, shadows, typography, layout sizes must come from :root variables

:root {
  --primary-color: #1fdae4;
  --text-primary: #1fdae4;
  --text-secondary: #6c757d;
  --primary-hover: #17c1ca;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;

  /* Light Theme */
  --light-bg: #f8f9fa;
  --light-text: #212529;
  --light-border: #dee2e6;
  --light-card: #ffffff;
  --light-hover: #1fdae4;

  /* Dark Theme */
  --dark-bg: #1a1d23;
  --dark-text: #ffff;
  --dark-border: #343a40;
  --dark-card: #2a2e35;
  --dark-hover: #1fdae4;

  /* Layout */
  --sidebar-width: 280px;
  --sidebar-collapsed-width: 70px;
  --header-height: 56px;

  /* Shadow */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

  /* Typography & Layout */
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --border-radius: 8px;
  --transition: all 0.3s ease;

  /* Light Color Variants */
  --primary-light: rgba(31, 218, 228, 0.1);
  --success-light: rgba(40, 167, 69, 0.1);
  --danger-light: rgba(220, 53, 69, 0.1);
  --warning-light: rgba(255, 193, 7, 0.1);
  --info-light: rgba(23, 162, 184, 0.1);

  /* Layout & Containers */
  --container-padding-mobile: 0.5rem;
  --container-padding-tablet: 1rem;
  --container-padding-desktop: 1.5rem;
}


Rule: Use only these variables in Tailwind classes (text-[var(--text-primary)], bg-[var(--primary-color)], etc.)

🌗 4. Light & Dark Mode (Strict)
body {
  background-color: var(--light-bg);
  color: var(--light-text);
  font-family: var(--font-family);
}

.dark body {
  background-color: var(--dark-bg);
  color: var(--dark-text);
}


❌ No hard-coded #fff, #000, or other colors

❌ No separate dark CSS files

✅ Only variable overrides allowed

Tailwind Tip: Use dark: modifier:

<div class="bg-[var(--light-card)] dark:bg-[var(--dark-card)]"></div>

🧹 5. CSS Reset (Mandatory & Frozen)
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}

#root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

✨ 6. Animations (Global Only)

Use Tailwind animation utilities first (animate-spin, animate-pulse)

Only create new global animations if Tailwind does not provide

No inline animations in components

📱 7. Responsiveness (Mobile-First)

Use Tailwind responsive utilities (sm:, md:, lg:, xl:)

Mobile-first approach

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>


Verify layouts on Mobile / Tablet / Desktop

🧭 8. Layout Structure (Sidebar & Header)
<aside class="w-[var(--sidebar-width)] dark:bg-[var(--dark-bg)]"></aside>
<header class="h-[var(--header-height)] dark:bg-[var(--dark-bg)]"></header>


❌ No hard-coded widths/heights

Use Tailwind classes with variables

🔘 9. Tailwind-First Rule (Strict)

If Tailwind provides utility → use it

If not → use :root variables with custom CSS in index.css

❌ No duplicate styles

Example:

✅ Correct:

<div class="flex gap-4 p-4 rounded shadow-sm"></div>


❌ Wrong:

.box { display: flex; padding: 16px; border-radius: 8px; }

🔘 10. Buttons — Single Design System

Use Tailwind classes + variables

<button class="px-4 py-2 rounded-md font-medium transition-colors
  bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]">
  Primary
</button>


❌ No inconsistent sizing

✅ Height, padding, radius, transitions must match across app

📊 11. Tables — Unified Style

Tailwind table utilities + variables:

<table class="min-w-full border border-[var(--light-border)] dark:border-[var(--dark-border)]">
  <thead class="bg-[var(--light-card)] dark:bg-[var(--dark-card)]">
    <tr><th class="p-2 text-left">Header</th></tr>
  </thead>
  <tbody>
    <tr class="hover:bg-[var(--row-hover-bg)]">
      <td class="p-2">Data</td>
    </tr>
  </tbody>
</table>


Same padding, hover, header styling

✅ Light/Dark consistency

🧩 12. Cards — Consistent Structure
<div class="bg-[var(--light-card)] dark:bg-[var(--dark-card)]
            rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
  Card content
</div>


❌ No different card designs per page

🎚 13. Spacing, Radius & Shadows

Use Tailwind utilities + variables

Aspect	Tailwind Example
Margin/Padding	m-4 p-4 gap-4
Border Radius	rounded, rounded-md
Shadows	shadow-sm, shadow-md, shadow-lg
Transition	transition-all duration-300

❌ No custom pixel values

🧠 14. UX Priority

Simple, intuitive, self-explanatory

Global font: font-family: var(--font-family)

Ensure contrast in Light/Dark modes

No hidden/confusing elements

🧹 15. Custom CSS Decision Rule

Before writing any CSS:

Can Tailwind solve it? → ✅ Use Tailwind

Can a variable solve it? → ✅ Use variable

Only if neither → minimal CSS in index.css with comment

Example:

/* Custom scroll for sidebar - Tailwind cannot fully handle */
.sidebar-scroll {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--primary-color) transparent;
}

👨‍💻 16. Developer Rules

CSS allowed only in index.css or :root variables

Do not duplicate Tailwind behavior

Reuse existing patterns

New styles only if absolutely necessary

Code must be clean, readable, maintainable

🔑 Final Checklist

✅ Test Light & Dark mode

✅ Verify contrast across app

✅ Test all breakpoints

✅ Ensure UI consistency (buttons, tables, cards, spacing)

✅ Only Tailwind v4 + :root variables used

💡 Summary:

Bootstrap completely removed

Tailwind v4 classes first

:root variables mandatory for all colors, spacing, shadows

Custom CSS only if Tailwind/variables cannot handle

Light/Dark themes fully variable-driven

Mobile-first, enterprise-ready, consistent UI