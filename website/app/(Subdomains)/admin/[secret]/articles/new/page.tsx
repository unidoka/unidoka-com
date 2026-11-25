"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckUser } from "@/entities/user/model/check-user";
import { Card } from "@/components/ui/card";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { ArticleEditorForm } from "@/components/editor/article-editor-form";
import { useAdminSecret } from "@/hooks/use-admin-secret";
import { crossSubdomainUrl } from "@/utils/root-domain";
import {
  fetchAdminArticle,
  type Article,
  type ArticleLang,
} from "@/utils/api/articles";

function NewArticleContent() {
  const { secret } = useAdminSecret();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const requestedLang = searchParams.get("lang");

  const [source, setSource] = useState<Article | null>(null);
  const [loading, setLoading] = useState(Boolean(from));

  useEffect(() => {
    if (!from) return;
    let cancelled = false;
    setLoading(true);
    fetchAdminArticle(from)
      .then((article) => {
        if (!cancelled) setSource(article);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [from]);

  const targetLang: ArticleLang =
    requestedLang === "en" || requestedLang === "ru"
      ? requestedLang
      : source?.lang === "en"
        ? "ru"
        : "en";

  // A translation starts from the source body so it can be rewritten in place;
  // the slug is cleared so it is generated from the translated title.
  const template: Article | null = useMemo(
    () =>
      source && from
        ? { ...source, slug: "", lang: targetLang, translations: [] }
        : null,
    [source, from, targetLang],
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-heading-1 mb-1">
          {from ? "Новая языковая версия" : "Новая статья"}
        </h1>
        <p className="text-body-3 text-(--on-bg-medium)">
          {from
            ? `Версия на языке ${targetLang === "en" ? "English" : "русском"}. Текст скопирован из оригинала — переведите его и сохраните.`
            : "Заполните данные и опубликуйте статью в блоге."}
        </p>
      </div>

      {loading ? (
        <Card className="rounded-3xl border-(--outline) p-10 text-center">
          <CircleNotchIcon className="mx-auto size-5 animate-spin text-(--on-bg-low)" />
        </Card>
      ) : from && !source ? (
        <Card className="rounded-3xl border border-rose-500/30 bg-rose-500/5 p-6">
          <p className="text-body-4 text-(--error)">Исходная статья не найдена.</p>
        </Card>
      ) : (
        <ArticleEditorForm
          editing={null}
          template={template}
          redirectAfter={crossSubdomainUrl("admin", `/${secret || ""}/articles`)}
        />
      )}
    </div>
  );
}

export default function NewArticlePage() {
  return (
    <CheckUser permission="admin.articles">
      <Suspense fallback={null}>
        <NewArticleContent />
      </Suspense>
    </CheckUser>
  );
}
