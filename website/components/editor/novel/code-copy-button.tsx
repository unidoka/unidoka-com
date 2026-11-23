"use client";
import { useState } from "react";
import { Copy, Check } from "@phosphor-icons/react";
import { toast } from "sonner";

export function CodeCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Скопировано");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Не удалось скопировать");
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md text-(--on-bg-low) hover:text-(--on-bg-high) hover:bg-(--state-hover) transition-colors"
      title="Copy code"
    >
      {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
    </button>
  );
}
