import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ArrowUpRightIcon, GitBranchIcon, CubeIcon } from "@phosphor-icons/react/dist/ssr";
import { fetchPublicSolutionsServer } from "@/utils/api/solutions";
import { SolutionFilterBar } from "./_components/solution-filter-bar";
import { pageMetadata, buildOgImageUrl } from "@/utils/seo";

export const metadata = pageMetadata({
  title: "Решения",
  description:
    "Студия полного цикла, open-source фреймворк Amorfa и календарь IT-событий - продукты и сервисы Unidoka.",
  path: "/solutions",
  ogImage: buildOgImageUrl("Решения", "Rovno.dev"),
});

export const revalidate = 60;

const REPO_URL = "https://github.com/unidoka/unidoka-com";
const AMORFA_URL = "https://github.com/unidoka/amorfa";

export default async function SolutionsPage() {
  const solutions = await fetchPublicSolutionsServer();

  return (
    <div className="mt-header">
      <div className="pt-10">
        <SolutionFilterBar solutions={solutions} />
      </div>

      <section className="pb-24">
        <Container>
          <div className="rounded-3xl border border-(--outline) bg-(--card) p-8 md:p-10 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
            <div className="flex-1 min-w-0">
              <h2 className="text-heading-1 text-(--on-bg-high) mb-2">
                Всё, что можно открыть - открыто.
              </h2>
              <p className="text-body-3 text-(--on-bg-medium) leading-relaxed max-w-[560px]">
                Наши фреймворки, инструменты и сам этот сайт - публичны. Форкайте,
                изучайте, контрибьютьте.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Button size="large" shape="round" asChild>
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                  <GitBranchIcon className="size-4" />
                  unidoka-com
                  <ArrowUpRightIcon className="size-4" />
                </a>
              </Button>
              <Button size="large" variant="outlined" shape="round" asChild>
                <a href={AMORFA_URL} target="_blank" rel="noopener noreferrer">
                  <CubeIcon className="size-4" />
                  amorfa
                  <ArrowUpRightIcon className="size-4" />
                </a>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
