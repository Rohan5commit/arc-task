import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  leadingIcon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-emerald-400 text-slate-950 hover:bg-emerald-300 disabled:bg-emerald-400/40 disabled:text-slate-700",
  secondary:
    "bg-slate-800 text-slate-100 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-500",
  ghost:
    "bg-transparent text-slate-200 hover:bg-white/6 disabled:text-slate-600",
  danger:
    "bg-rose-500/15 text-rose-200 hover:bg-rose-500/25 disabled:bg-rose-500/10 disabled:text-rose-200/50"
};

export function Button({
  children,
  className = "",
  leadingIcon,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium transition-colors ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {leadingIcon}
      {children}
    </button>
  );
}
