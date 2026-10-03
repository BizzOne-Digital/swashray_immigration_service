"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "premium" | "outline" | "ghost";
type Size = "md" | "lg";

const base =
  "group relative inline-flex items-center justify-center gap-2 font-semibold tracking-wide transition-colors duration-200 rounded-[var(--radius-btn)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:opacity-50 disabled:pointer-events-none overflow-hidden";

// "secondary" keeps its historical meaning (gold premium CTA) for existing
// callers; "premium" is an explicit alias of the same treatment for new code.
const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-primary)] text-white shadow-[0_1px_2px_rgba(14,14,16,0.15)] hover:bg-[var(--color-secondary)] hover:shadow-[0_8px_20px_-6px_rgba(14,14,16,0.45)]",
  secondary:
    "bg-[var(--color-accent)] text-[var(--color-dark)] shadow-[0_1px_2px_rgba(0,0,0,0.12)] hover:shadow-[0_10px_22px_-8px_rgba(212,175,55,0.55)]",
  premium:
    "bg-[var(--color-accent)] text-[var(--color-dark)] shadow-[0_1px_2px_rgba(0,0,0,0.12)] hover:shadow-[0_10px_22px_-8px_rgba(212,175,55,0.55)]",
  outline:
    "border border-[var(--color-primary)]/25 text-[var(--color-primary)] bg-transparent hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5",
  ghost: "text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

// A hairline red accent that sweeps in along the bottom edge on hover — the
// "controlled red accent" micro-detail, kept small and only on solid/gold
// buttons so it never competes with the outline/ghost treatments. Plain CSS
// (group-hover) rather than Framer Motion: it sits on a pointer-events-none
// child, which can never receive its own hover, so it has to react to the
// parent's :hover instead.
function HoverAccent({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-[var(--color-highlight)] transition-transform duration-300 ease-out group-hover:scale-x-100"
    />
  );
}

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

// Framer Motion redefines several native DOM event-handler props with its own
// gesture/animation-lifecycle signatures (e.g. onDrag receives (event, info)
// rather than a plain DragEvent). Spreading native HTML attributes onto a
// motion component needs those keys omitted first or TS sees a conflict.
type MotionSafeOmit =
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration";

const MotionLink = motion.create(Link);

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, MotionSafeOmit>) {
  const showAccent = variant === "primary" || variant === "secondary" || variant === "premium";
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ y: 0, scale: 0.98 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
      <HoverAccent show={showAccent} />
    </motion.button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, MotionSafeOmit>) {
  const showAccent = variant === "primary" || variant === "secondary" || variant === "premium";
  return (
    <MotionLink
      href={href}
      whileHover={{ y: -2 }}
      whileTap={{ y: 0, scale: 0.98 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
      <HoverAccent show={showAccent} />
    </MotionLink>
  );
}
