"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { CheckUser } from "@/entities/user/model/check-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleNotchIcon, PlusIcon, WarningIcon } from "@phosphor-icons/react";
import { fetchAdminArticle, type Article } from "@/utils/api/articles";
import { ArticleEditorForm } from "@/components/editor/article-editor-form";
import { useAdminSecret } from "@/hooks/use-admin-secret";
import { crossSubdomainUrl } from "@/utils/root-domain";
import { locales, localeNames } from "@/i18n/config";

export default function EditArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { secret } = useAdminSecret();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchAdminArticle(slug)
      .then((a) => {
        if (!a) setError("Статья не найдена");
        else setArticle(a);
      })
      .catch((err) => setError(err?.message || "Ошибка"))
      .finally(() => setLoading(false));
  }, [slug]);

  const base = crossSubdomainUrl("admin", `/${secret || ""}/articles`);
  const translations = article?.translations ?? [];
  const missingLangs = article
    ? locales.filter(
        (code) =>
          code !== article.lang && !translations.some((t) => t.lang === code),
      )
    : [];

  return (
    <CheckUser permission="admin.articles">
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-heading-1 mb-1">Редактирование</h1>
          <p className="text-body-3 text-(--on-bg-medium) font-mono">/blog/{slug}</p>
        </div>
        {loading && (
          <Card className="rounded-3xl border-(--outline) p-10 text-center">
            <CircleNotchIcon className="size-5 animate-spin mx-auto text-(--on-bg-low)" />
          </Card>
        )}
        {error && (
          <Card className="rounded-3xl border border-rose-500/30 bg-rose-500/5 p-6">
            <div className="flex items-start gap-4">
              <WarningIcon className="size-5 text-rose-500 shrink-0" />
              <div>
                <h2 className="text-heading-4 mb-1">{error}</h2>
                <code className="text-body-5 font-mono text-(--on-bg-low)">{slug}</code>
              </div>
            </div>
          </Card>
        )}
        {article && (
          <Card className="rounded-3xl border-(--outline) p-5 space-y-3">
            <h2 className="text-heading-4">Языковые версии</h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-(--outline) px-3 py-1 text-body-5 text-(--on-bg-medium)">
                {localeNames[article.lang]} · текущая
              </span>
              {translations.map((translation) => (
                <Link
                  key={translation.slug}
                  href={`${base}/${translation.slug}/edit`}
                  className="inline-flex items-center rounded-full border border-(--outline) px-3 py-1 text-body-5 text-(--on-bg-medium) transition-colors hover:border-(--primary)/40 hover:text-(--primary)"
                >
                  {localeNames[translation.lang]}
                </Link>
              ))}
            </div>
            {missingLangs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {missingLangs.map((code) => (
                  <Button key={code} variant="outlined" size="small" asChild>
                    <Link
                      href={`${base}/new?from=${encodeURIComponent(article.slug)}&lang=${code}`}
                    >
                      <PlusIcon className="size-4" />
                      {localeNames[code]}-версия
                    </Link>
                  </Button>
                ))}
              </div>
            )}
          </Card>
        )}
        {article && (
          <ArticleEditorForm
            editing={article}
            redirectAfter={base}
          />
        )}
      </div>
    </CheckUser>
  );
}
