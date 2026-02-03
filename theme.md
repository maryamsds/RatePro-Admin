🎨 UI / Theme Guidelines for Project (Bootstrap 5 – Final)

This document defines the single source of truth for UI, theme, and styling decisions in this project.
All rules are global, strict, and non-negotiable.

Goal:
➡ Clean, modern, scalable, enterprise-ready SaaS UI
➡ Bootstrap utilities first, custom CSS last

🎯 1. Design Philosophy (Big Picture)

UI must be modern, minimal, clean, elegant

❌ No heavy, flashy, decorative, or over-styled UI

Consistency > creativity

UI should feel professional, calm, enterprise-grade

Less UI, more clarity.

🧱 2. Global CSS Architecture (Mandatory)

Only ONE global CSS system is allowed.

✅ Allowed Global CSS

Custom CSS is allowed only for:

:root design tokens (colors, spacing, layout, transitions)

Minimal CSS reset

Global reusable animations

Dark mode variable overrides

❌ No component-specific styling
❌ No page-specific CSS
❌ No duplicate Bootstrap behavior

🎨 3. :root — Design Tokens (Single Source of Truth)

All colors, spacing, shadows, typography, and layout sizes must come from :root variables.

Bootstrap Color Overrides (Approved)
:root {
  --bs-primary: #1fdae4;
  --bs-primary-rgb: 31, 218, 228;
}

Rules:

.btn-primary, .text-primary, .bg-primary must rely on these

❌ Never hard-code Bootstrap colors elsewhere

Theme & UI Variables (Locked)

The following categories are official and frozen:

Light & Dark colors

Layout sizing (sidebar, header)

Typography

Spacing scale

Shadows

Transitions

Hover & state colors

👉 Developers consume variables, never redefine them.

🌗 4. Light & Dark Mode (Strict)

Dark mode works only via variable switching, not duplicate CSS.

body {
  background-color: var(--light-bg);
  color: var(--light-text);
  font-family: var(--font-family);
}


.dark body {
  background-color: var(--dark-bg);
  color: var(--dark-text);
}

Rules:

❌ No #fff, #000, or hard-coded colors

❌ No separate dark CSS files

✅ Only variable overrides are allowed

🧹 5. CSS Reset (Mandatory & Frozen)

The following reset must exist and must not be changed:

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}


html,
body {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}


#root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

Purpose:

Predictable layouts

No browser inconsistencies

Stable flex-based app shell

✨ 6. Animations (Global Only)

Animations are allowed only when:

Reusable

Semantic (fade, slide, pulse, loading)

Improve UX clarity

Rules:

All @keyframes must be global

❌ No inline animations in components

❌ No duplicate animations

👉 Use existing animations first
👉 Create new ones only if none exist

📱 7. Responsiveness (Mobile-First)

Entire app must be mobile-first

Use Bootstrap responsive utilities only

Examples:

col-*
col-sm-*
col-md-*
col-lg-*
col-xl-*
d-none d-md-block

Test every screen on:

Mobile

Tablet

Desktop

🧭 8. Layout Structure (Sidebar & Header)
Sidebar

Expanded width → --sidebar-width (280px)

Collapsed width → --sidebar-collapsed-width (70px)

Header

Fixed height → --header-height (64px)

Rules:

Sizes come only from variables

❌ No hard-coded widths/heights

🧩 9. Bootstrap-First Rule (Very Strict)

If Bootstrap provides a utility or component, custom CSS is FORBIDDEN.

✅ Correct
<div class="d-flex gap-2 p-3 rounded shadow-sm"></div>
❌ Wrong
.box {
  display: flex;
  padding: 12px;
  border-radius: 8px;
}

This rule applies to:

Layout

Spacing

Typography

Colors

Flex/Grid

Shadows

Borders

🔘 10. Buttons — Single Design System

Buttons must follow one Bootstrap-based system.

Allowed variants:

Primary → btn btn-primary

Secondary → btn btn-secondary

Outline → btn btn-outline-*

Danger → btn btn-danger

Rules:

Same height

Same padding

Same border radius

Same transitions

❌ No custom button styles unless Bootstrap cannot do it

📊 11. Tables — One Global Style

❌ Different table designs across pages are NOT allowed

✅ Entire app must use one unified Bootstrap table style

Rules:

.table base

Same spacing

Same hover behavior

Same header styling

Same Light/Dark behavior

Any table change → global only

🧩 12. Cards — Consistent Structure

All cards must follow Bootstrap structure:

.card
.card-body

Rules:

Same padding

Same border radius

Same shadow level

Only content changes, never structure.

🎚 13. Spacing, Radius & Shadows
Spacing (Critical)

❌ No custom margin/padding CSS

Use only:

m-*  p-*  mt-*  mb-*  gap-*
Border Radius

Use Bootstrap first:

rounded
rounded-1
rounded-2
rounded-pill
Shadows
shadow-sm
shadow
shadow-lg
🧠 14. UX Priority (Non-Negotiable)

UI must be simple, intuitive, self-explanatory

Global font:

font-family: var(--font-family)

❌ No component should look:

dull

hidden

confusing

In either Light or Dark mode

🧹 15. Custom CSS Decision Rule (Strict)

Before writing any CSS, ask:

Does Bootstrap utility exist?
→ YES → Use Bootstrap
→ NO → Continue

Can it be solved via :root variable?
→ YES → Add variable
→ NO → Write minimal CSS

If this flow is not followed → code review fail

👨‍💻 16. Developer Rules

CSS allowed only in:

App.css

:root variables

Do not duplicate Bootstrap behavior

Reuse existing patterns

New styles only when absolutely necessary

Code must be:

clean

readable

maintainable

🔑 Final Rule

If Bootstrap can do it, custom CSS must NOT be written.
Inconsistent UI is a bug, not a feature.

✅ Final Checklist

Test Light & Dark mode

Verify contrast on all components

Test all breakpoints

Ensure UI consistency across the app