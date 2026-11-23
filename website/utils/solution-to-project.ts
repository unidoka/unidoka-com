import type { Project } from "@/app/_data/projects";
import type { Solution } from "@/utils/api/solutions";

/** Adapt a CMS solution to the shape ProjectCard already renders. */
export function solutionToProject(s: Solution): Project {
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    shortDescription: s.short_description || undefined,
    cover: {
      imageSrc: s.cover_image_src || "",
      videoSrc: s.cover_video_src || undefined,
    },
    category: s.category || "",
    clientId: s.client_id || "",
    period: s.period || undefined,
    techStack: s.tech_stack,
    tags: (s.tags || []).map((t) => ({ title: t.title })),
  };
}
