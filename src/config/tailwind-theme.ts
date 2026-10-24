// Tailwind is loaded from the CDN (@tailwindcss/browser), so the theme lives in a
// <style type="text/tailwindcss"> block instead of a config file. Keep these tokens
// in sync with STYLES.md.
export const TAILWIND_CDN_URL = "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.3.3";

export const TAILWIND_THEME = `
@theme {
  --color-canvas: #0E1014;
  --color-surface: #15181E;
  --color-elevated: #1C2028;
  --color-line: #2A2F39;
  --color-line-strong: #3A414D;

  --color-fg: #E7E9EE;
  --color-fg-muted: #A0A7B4;
  --color-fg-subtle: #6E7684;

  --color-accent: #5CB8A9;
  --color-accent-strong: #78CABD;
  --color-on-accent: #0B1715;

  --color-danger: #E5676F;
  --color-success: #63C08A;
  --color-warning: #E0B25C;
  --color-info: #74A9E6;

  --font-sans: var(--font-montserrat), var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI",
    system-ui, "Helvetica Neue", Arial, sans-serif;
}
`;

/** Shared with react-hot-toast, which styles its toasts with inline objects. */
export const THEME_COLORS = {
  surface: "#1C2028",
  line: "#2A2F39",
  fg: "#E7E9EE",
  success: "#63C08A",
  danger: "#E5676F",
  canvas: "#0E1014",
} as const;
