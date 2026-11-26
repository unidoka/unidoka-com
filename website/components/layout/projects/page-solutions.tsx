import { Container } from "@/components/ui/container";
import ProjectCard from "@/components/layout/projects/project-card";
import { fetchPublicSolutionsServer } from "@/utils/api/solutions";
import { solutionToProject } from "@/utils/solution-to-project";

/**
 * Solutions explicitly attached to a page in the admin (`solutions.page`).
 * Renders nothing when none match, so marketing pages can mount it freely.
 */
export async function PageSolutions({
  page,
  title,
}: {
  page: string;
  title: string;
}) {
  const solutions = await fetchPublicSolutionsServer({ page });
  if (solutions.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <Container>
        <h2 className="mb-10 text-display-3 leading-[1.05]! md:text-display-2">
          {title}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((solution, index) => (
            <ProjectCard
              key={solution.id}
              project={solutionToProject(solution)}
              index={index}
              variant="clean"
              href={`/solutions/${solution.slug}`}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
