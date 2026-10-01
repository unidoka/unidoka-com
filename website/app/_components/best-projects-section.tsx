import { Container } from "@/components/ui/container";
import { PROJECTS } from "@/app/_data/projects";
import ProjectCard from "@/components/layout/projects/project-card";
import { Button } from "@/components/ui/button";
import Link from 'next/link'
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import { useLanguage } from "@/providers/language-provider";
export default function BestWorksSection() {
  const { t } = useLanguage();
  return (
    <section className="py-8 md:py-10">
      <Container>
        <h2 className="text-display-2 sm:text-display-1 mb-10 text-center">
          {t("home.best_works_title")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[PROJECTS.alx, PROJECTS.sadovod, PROJECTS.vanguard, PROJECTS.courtElegance, PROJECTS.bread, PROJECTS.concord].map((project, idx) => (
            <ProjectCard key={idx} project={project} index={idx} />
          ))}
        </div>
        <Button className="w-full md:w-fit mt-8" variant="glass" size="large" asChild>
          <Link href="/projects">
            {t("home.view_all_projects")}
            <CaretRightIcon className="size-4" />
          </Link>
        </Button>
      </Container>
    </section>
  );
}
