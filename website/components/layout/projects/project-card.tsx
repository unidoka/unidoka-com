import { Project } from "@/app/_data/projects";
import Image from "next/image";
import Link from "next/link";
export interface ProjectTagRef {
  id?: string;
  name?: string;
  label?: string;
  slug?: string;
}
export default function ProjectCard({
  project,
  index,
  categoryMap = {},
  tags = [],
}: {
  project: Project;
  index?: number;
  categoryMap?: Record<string, string>;
  tags?: ProjectTagRef[];
}) {
  const catLabel = project.category ? categoryMap[project.category] || project.category : "";
  const normalizedTags = (tags || [])
    .map((t) => {
      if (typeof t === "string") return t;
      return t.name || t.label || "";
    })
    .filter(Boolean)
    .slice(0, 8);
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block animate-reveal fill-mode-both"
      style={{ animationDelay: `${index ? index * 100 : 100}ms` }}
    >
      <div className="relative h-full flex flex-col overflow-hidden rounded-2xl bg-(--card) border border-(--outline) transition-all duration-300 hover:border-(--primary)/30 hover:shadow-lg hover:shadow-(--primary)/5">
        <div className="relative aspect-[16/9] w-full overflow-hidden shrink-0">
          <Image
            src={project.cover.imageSrc}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="p-5 md:p-6 flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-body-1 md:text-display-5 font-semibold text-(--on-bg-high) leading-tight truncate">
              {project.title}
            </h3>
            <span className="text-(--on-bg-low) text-xs shrink-0">↗</span>
          </div>
          {catLabel && (
            <p className="text-body-5 text-(--on-bg-medium) font-medium uppercase tracking-[0.14em]">
              {catLabel}
            </p>
          )}
          {normalizedTags.length > 0 && (
            <div className="mt-1 flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
              {normalizedTags.map((t, i) => (
                <span
                  key={`${t}-${i}`}
                  className="shrink-0 inline-flex items-center rounded-full border border-(--outline) bg-(--bg) px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-(--on-bg-medium)"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
