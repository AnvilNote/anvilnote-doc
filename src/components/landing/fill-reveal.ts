// Shared interaction tokens for links whose foreground colour fills from left
// to right. `foreground` and `background` are theme variables, so light and
// dark themes automatically invert without a separate colour branch.
export const fillRevealSurfaceClass =
  "relative isolate overflow-hidden transition-colors before:absolute before:inset-0 before:z-0 before:origin-left before:scale-x-0 before:bg-foreground before:transition-transform before:duration-300 hover:text-background hover:before:scale-x-100 focus-visible:text-background focus-visible:outline-none focus-visible:before:scale-x-100 focus-visible:before:ring-1 focus-visible:before:ring-foreground/40 motion-reduce:transition-none motion-reduce:before:transition-none";

export const fillRevealContentClass = "relative z-10";
