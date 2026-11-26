import type { Project } from "@/app/_data/projects";
import type { Article } from "@/utils/api/articles";

/** Adapt a CMS article to the shape ProjectCard already renders. */
export function articleToProject(a: Article): Project {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    shortDescription: a.description || undefined,
    cover: {
      imageSrc: a.cover_image_src || "",
      videoSrc: a.cover_video_src || undefined,
      aspect: 16 / 9,
    },
    category: a.category || "",
    clientId: "",
    techStack: [],
    tags: (a.tags || []).map((t) => ({ title: t.title })),
  };
}
