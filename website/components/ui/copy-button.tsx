"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CopyIcon, CheckIcon } from "@phosphor-icons/react";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="text"
          size="icon-xsmall"
          className={className}
          onClick={handleCopy}
          aria-label="CopyIcon to clipboard"
        >
          {copied ? <CheckIcon className="size-3!" /> : <CopyIcon className="size-3!" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        {copied ? "Copied!" : "Copy"}
      </TooltipContent>
    </Tooltip>
  );
}
