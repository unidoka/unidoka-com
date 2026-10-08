import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import { Container } from "@/components/ui/container";
import {
  fetchPublicSolutionServer,
} from "@/utils/api/solutions";
import {
  SOLUTION_CUSTOM_PAGES,
} from "./_components/solution-custom-pages";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const solution = await fetchPublicSolutionServer(slug);
  if (!solution) return { title: "Solution not found" };
  return {
    title: solution.seo_title || `${solution.title} · Unidoka`,
    description: solution.meta_description || solution.short_description || undefined,
    openGraph: {
      title: solution.seo_title || solution.title,
      description: solution.meta_description || solution.short_description || undefined,
      images: solution.cover_image_src ? [solution.cover_image_src] : undefined,
    },
  };
}

export default async function SolutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const solution = await fetchPublicSolutionServer(slug);
  if (!solution) notFound();

  // ── Custom page override ────────────────────────────────────────
  // If the solution has `custom_page` set and a component is
  // registered for it, render that instead of the MDX content.
  if (solution.custom_page) {
    const CustomPage = SOLUTION_CUSTOM_PAGES[solution.custom_page];
    if (CustomPage) {
      return <CustomPage solution={solution} />;
    }
    // custom_page is set but not registered — fall through to MDX.
  }

  // ── Default: render MDX content ─────────────────────────────────
  const { content } = await compileMDX({
    source: solution.mdx_content || solution.description || "",
    options: { parseFrontmatter: false },
  });

  return (
    <main className="min-h-screen bg-(--bg)">
      <section className="pt-32 pb-12 border-b border-(--outline)">
        <Container>
          <div className="max-w-4xl">
            {solution.category && (
              <p className="text-body-5 uppercase tracking-[0.3em] text-(--on-bg-low) mb-4">
                {solution.category}
                {solution.period && ` · ${solution.period}`}
              </p>
            )}
            <h1 className="text-display-1 font-heading font-medium tracking-tight text-(--on-bg-high) leading-[0.95] mb-6">
              {solution.title}
            </h1>
            {solution.short_description && (
              <p className="text-body-1 text-(--on-bg-medium) max-w-2xl leading-relaxed">
                {solution.short_description}
              </p>
            )}
            {(solution.tags ?? []).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {(solution.tags ?? []).map((t, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-full border border-(--outline) bg-(--bg) px-3 py-1 text-body-5 text-(--on-bg-medium)"
                  >
                    {t.title}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>
      {solution.cover_image_src && (
        <section className="py-8">
          <Container>
            <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border border-(--outline)">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={solution.cover_image_src}
                alt={solution.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </Container>
        </section>
      )}
      <section className="py-12 md:py-20">
        <Container>
          <article className="max-w-[760px] prose prose-neutral dark:prose-invert">
            {content}
          </article>
        </Container>
      </section>
    </main>
  );
}
