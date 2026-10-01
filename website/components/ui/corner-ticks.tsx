import { cn } from "@/lib/utils";
/**
 * Four small "+" marks at the corners of a relatively-positioned parent.
 * Structural decoration in the technical / blueprint language: it reads
 * as a registration mark on a schematic, not as ornament. Purely visual,
 * hidden from assistive tech.
 */
export function CornerTicks({
  className,
  size = "sm",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  const text = size === "sm" ? "text-[10px]" : "text-[12px]";
  const inset = size === "sm" ? "top-2 left-2" : "top-3 left-3";
  const insetR = size === "sm" ? "top-2 right-2" : "top-3 right-3";
  const insetB = size === "sm" ? "bottom-2 left-2" : "bottom-3 left-3";
  const insetBR = size === "sm" ? "bottom-2 right-2" : "bottom-3 right-3";
  const base = cn(
    "absolute select-none font-mono leading-none text-(--on-bg-low)/60 pointer-events-none",
    text,
    className,
  );
  return (
    <>
      <span aria-hidden className={cn(base, inset)}>+</span>
      <span aria-hidden className={cn(base, insetR)}>+</span>
      <span aria-hidden className={cn(base, insetB)}>+</span>
      <span aria-hidden className={cn(base, insetBR)}>+</span>
    </>
  );
}
