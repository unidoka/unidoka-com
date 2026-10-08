"use client";

import type { Solution } from "@/utils/api/solutions";
import { NashDevPage } from "./nash-dev-page";

/**
 * Registry mapping a `custom_page` key (from the DB) to the component
 * that renders it. If a solution has `custom_page = "nash-dev"` set,
 * the public /solutions/[slug] page will render <NashDevPage /> instead
 * of the MDX content.
 *
 * All custom page components receive the full Solution object as a prop,
 * so they can read title, cover, tags, etc. if needed.
 */
export type CustomSolutionPageProps = {
  solution: Solution;
};

export const SOLUTION_CUSTOM_PAGES: Record<
  string,
  React.ComponentType<CustomSolutionPageProps>
> = {
  "nash-dev": NashDevPage,
};
