// src/constants/ButtonVariants.js
// Reusable button variant classes for consistent UI hierarchy across the app.

export const buttonVariants = {
  primary:   "bg-[var(--primary-color)] text-white hover:opacity-90 transition-opacity",
  ai:        "bg-[var(--accent-teal)] text-white hover:opacity-90 transition-opacity",
  secondary: "border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white transition-colors",
  warning:   "border border-yellow-500 text-yellow-600 hover:bg-yellow-50 transition-colors",
  neutral:   "border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
  danger:    "bg-[var(--danger-color)] text-white hover:opacity-90 transition-opacity",
};
