"use client";

import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";

interface FormFieldProps {
  label: string;
  /** Field path in the form; used to show its validation error. */
  name?: string;
  hint?: string;
  required?: boolean;
  /** Render a <div> instead of a <label>, for fields that group several controls. */
  isGroup?: boolean;
  className?: string;
  children: ReactNode;
}

export function FormField({ label, name, hint, required, isGroup, className = "", children }: FormFieldProps) {
  const { formState, getFieldState } = useFormContext();
  const error = name ? getFieldState(name, formState).error : undefined;
  const Wrapper = isGroup ? "div" : "label";

  return (
    <Wrapper className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
        {label}
        {required && <span className="ml-0.5 text-accent in-[fieldset:disabled]:hidden">*</span>}
      </span>
      {children}
      {error?.message ? (
        <span className="text-xs text-danger">{error.message}</span>
      ) : (
        hint && <span className="text-xs text-fg-subtle in-[fieldset:disabled]:hidden">{hint}</span>
      )}
    </Wrapper>
  );
}
