"use client";

import { use, useEffect, useState } from "react";
import { CheckUser } from "@/entities/user/model/check-user";
import { Card } from "@/components/ui/card";
import { CircleNotchIcon, WarningIcon } from "@phosphor-icons/react";
import { fetchAdminArticle, type Article } from "@/utils/api/articles";
import { ArticleEditorForm } from "@/components/editor/article-editor-form";
import { useAdminSecret } from "@/hooks/use-admin-secret";
import { crossSubdomainUrl } from "@/utils/root-domain";

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
          <ArticleEditorForm
            editing={article}
            redirectAfter={crossSubdomainUrl("admin", `/${secret || ""}/articles`)}
          />
        )}
      </div>
    </CheckUser>
  );
}
