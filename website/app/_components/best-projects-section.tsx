"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CaretRightIcon } from "@phosphor-icons/react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import ProjectCard from "@/components/layout/projects/project-card";
import { useLanguage } from "@/providers/language-provider";
import { $fetch } from "@/utils/fetch";
import type { Project } from "@/app/_data/projects";

/**
 * Best-works grid. Pulls featured projects from the backend so the
 * homepage never drifts from what's actually in the DB. If the API
 * returns nothing (or fails), we render an honest empty state instead
 * of falling back to hardcoded seed data.
 */
function mapApiProject(p: any): Project {
  return {
    id: String(p.id ?? p.slug ?? ""),
    slug: String(p.slug ?? ""),
    title: String(p.title ?? ""),
    description: p.description ?? undefined,
    shortDescription: p.short_description ?? undefined,
    cover: {
      imageSrc: String(p.cover_image_src ?? p.cover?.imageSrc ?? ""),
      videoSrc: p.cover_video_src ?? p.cover?.videoSrc ?? undefined,
    },
    href: p.href ?? undefined,
    category: (p.category ?? "e-commerce") as any,
    clientId: String(p.client_id ?? p.clientId ?? ""),
    period: p.period ?? undefined,
  };
}

export default function BestWorksSection() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[] | null>(null);

  useEffect(() => {
    $fetch("/api/v1/projects?featured=true&limit=6", { isToast: false })
      .then((res) => {
        if (Array.isArray(res?.json)) {
          setProjects(res.json.map(mapApiProject));
        } else {
          setProjects([]);
        }
      })
      .catch(() => setProjects([]));
  }, []);

  return (
    <section className="py-8 md:py-10">
      <Container>
        <h2 className="text-display-2 sm:text-display-1 mb-10 text-center">
          {t("home.best_works_title")}
        </h2>
        {projects === null ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="aspect-[16/9] rounded-2xl bg-muted/30 animate-pulse"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-(--outline) p-12 text-center">
            <p className="text-body-3 text-(--on-bg-medium)">
              {t("home.no_projects")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, idx) => (
              <ProjectCard
                key={project.id || project.slug || idx}
                project={project}
                index={idx}
              />
            ))}
          </div>
        )}
        <Button
          className="w-full md:w-fit mt-8"
          variant="glass"
          size="large"
          asChild
        >
          <Link href="/projects">
            {t("home.view_all_projects")}
            <CaretRightIcon className="size-4" />
          </Link>
        </Button>
      </Container>
    </section>
  );
}
