"use client";

import { createContext, useContext } from "react";

/** True while the god form only shows data (detail page before pressing "Editar"). */
const GodFormReadOnlyContext = createContext(false);

export const GodFormReadOnlyProvider = GodFormReadOnlyContext.Provider;

export function useIsGodFormReadOnly(): boolean {
  return useContext(GodFormReadOnlyContext);
}
