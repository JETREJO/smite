"use client";

import { createContext, useContext } from "react";

/** True while a form only shows data (detail pages before pressing "Editar"). */
const FormReadOnlyContext = createContext(false);

export const FormReadOnlyProvider = FormReadOnlyContext.Provider;

export function useIsFormReadOnly(): boolean {
  return useContext(FormReadOnlyContext);
}
