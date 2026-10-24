import Link from "next/link";
import type { ComponentProps } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent-strong",
  secondary: "border border-line-strong bg-elevated text-fg hover:border-fg-subtle",
  ghost: "text-fg-muted hover:bg-elevated hover:text-fg",
  danger: "text-danger hover:bg-danger/10",
};

export function getButtonClasses(variant: ButtonVariant = "primary", className = ""): string {
  return `${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`;
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
}

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={getButtonClasses(variant, className)} {...props} />;
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
}

export function ButtonLink({ variant = "primary", className, ...props }: ButtonLinkProps) {
  return <Link className={getButtonClasses(variant, className)} {...props} />;
}
