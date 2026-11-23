"use client";

import { CheckUser } from "@/entities/user/model/check-user";
import { ArticleEditorForm } from "@/components/editor/article-editor-form";
import { useAdminSecret } from "@/hooks/use-admin-secret";
import { crossSubdomainUrl } from "@/utils/root-domain";

export default function NewArticlePage() {
  const { secret } = useAdminSecret();
  return (
    <CheckUser permission="admin.articles">
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-heading-1 mb-1">Новая статья</h1>
          <p className="text-body-3 text-(--on-bg-medium)">
            Заполните данные и опубликуйте статью в блоге.
          </p>
        </div>
        <ArticleEditorForm
          editing={null}
          redirectAfter={crossSubdomainUrl("admin", `/${secret || ""}/articles`)}
        />
      </div>
    </CheckUser>
  );
}
