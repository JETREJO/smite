"use client";

import { Toaster } from "react-hot-toast";

import { THEME_COLORS } from "@/config/tailwind-theme";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: "text-sm font-sans",
        style: {
          background: THEME_COLORS.surface,
          color: THEME_COLORS.fg,
          border: `1px solid ${THEME_COLORS.line}`,
        },
        success: { iconTheme: { primary: THEME_COLORS.success, secondary: THEME_COLORS.canvas } },
        error: { iconTheme: { primary: THEME_COLORS.danger, secondary: THEME_COLORS.canvas }, duration: 6000 },
      }}
    />
  );
}
