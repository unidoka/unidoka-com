"use client";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";
interface TerminalStyledInlineProps {
  command?: string;
  className?: string;
}
export function TerminalStyledInline({
  command = "git clone https://github.com/unidoka/amorfa",
  className = ""
}: TerminalStyledInlineProps) {
  return (
    <div className={cn("relative mb-4 text-left bg-card border border-outline rounded-lg p-4 relative", className)}>
      <div className="overflow-x-scroll">
        <pre className="text-(--green-4) font-mono text-sm whitespace-no-wrap"><span className="text-(--on-bg-high)">$ </span>{command}</pre>
      </div>
      <CopyButton
        text={command}
        className="absolute top-2 right-2"
      />
    </div>
  );
}
