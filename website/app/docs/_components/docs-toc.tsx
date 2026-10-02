"use client";

import { Toc } from "@/components/layout/toc/toc";
import type { LegalHeading } from "@/app/_data/legal";

interface DocsTOCProps {
  headings: LegalHeading[];
}

export function DocsTOC({ headings }: DocsTOCProps) {
  return (
    <Toc
      headings={headings}
      label="Содержание"
      ariaLabel="Содержание документа"
    />
  );
}
