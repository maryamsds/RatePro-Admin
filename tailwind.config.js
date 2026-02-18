/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary-color)",
          hover: "var(--primary-hover)",
          light: "var(--primary-light)",
        },
        secondary: "var(--secondary-color)",
        success: {
          DEFAULT: "var(--success-color)",
          light: "var(--success-light)",
        },
        danger: {
          DEFAULT: "var(--danger-color)",
          light: "var(--danger-light)",
        },
        warning: {
          DEFAULT: "var(--warning-color)",
          light: "var(--warning-light)",
        },
        info: {
          DEFAULT: "var(--info-color)",
          light: "var(--info-light)",
        },
        light: {
          bg: "var(--light-bg)",
          text: "var(--light-text)",
          border: "var(--light-border)",
          card: "var(--light-card)",
          hover: "var(--light-hover)",
        },
        dark: {
          bg: "var(--dark-bg)",
          text: "var(--dark-text)",
          border: "var(--dark-border)",
          card: "var(--dark-card)",
          hover: "var(--dark-hover)",
        },
      },
      fontFamily: {
        sans: "var(--font-family)",
      },
      borderRadius: {
        DEFAULT: "var(--border-radius)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      width: {
        sidebar: "var(--sidebar-width)",
        "sidebar-collapsed": "var(--sidebar-collapsed-width)",
      },
      height: {
        header: "var(--header-height)",
      },
      spacing: {
        "container-mobile": "var(--container-padding-mobile)",
        "container-tablet": "var(--container-padding-tablet)",
        "container-desktop": "var(--container-padding-desktop)",
      },
      transitionProperty: {
        DEFAULT: "var(--transition)",
      },
    },
  },
  plugins: [],
}
