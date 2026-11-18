import { fetchPublicSolutionsServer } from "@/utils/api/solutions";
import { SolutionFilterBar } from "./_components/solution-filter-bar";

export const revalidate = 60;

/**
 * /solutions index.
 *
 * Metadata lives in ./layout.tsx. The client layout already renders a
 * <main>, so this page uses a plain wrapper — nesting <main> inside
 * <main> is invalid HTML.
 *
 * Top padding clears the sticky header (55px mobile / 80px sm+) that
 * the root client-layout pulls up with `-mt-[60px]`.
 *
 * An unreachable API resolves to an empty array, so the filter bar
 * renders its honest empty state instead of the route 404-ing.
 */
export default async function SolutionsPage() {
  const solutions = await fetchPublicSolutionsServer();

  return (
    <div className="min-h-screen bg-(--bg) pt-24 sm:pt-28">
      <SolutionFilterBar solutions={solutions} />
    </div>
  );
}
