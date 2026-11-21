import { fetchPublicSolutionsServer } from "@/utils/api/solutions";
import { SolutionFilterBar } from "./_components/solution-filter-bar";

export const revalidate = 60;

export default async function SolutionsPage() {
  const solutions = await fetchPublicSolutionsServer();

  return (
    <div className="pt-24 sm:pt-28">
      <SolutionFilterBar solutions={solutions} />
    </div>
  );
}
