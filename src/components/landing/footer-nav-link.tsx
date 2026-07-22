import type { ReactNode } from "react";
import { Link } from "@/lib/i18n/navigation";
import { fillRevealContentClass, fillRevealSurfaceClass } from "./fill-reveal";

type FooterNavLinkProps = {
  href: "/feedback" | "/privacy" | "/terms";
  children: ReactNode;
};

// A text link with a theme-aware fill that grows from left to right. Keeping
// this behavior separate lets every footer text link share the same motion,
// reduced-motion fallback, and keyboard focus treatment.
export function FooterNavLink({ href, children }: FooterNavLinkProps) {
  return (
    <Link
      href={href}
      className={`${fillRevealSurfaceClass} inline-flex px-1 py-0.5`}
    >
      <span className={fillRevealContentClass}>{children}</span>
    </Link>
  );
}
