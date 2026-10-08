"use client";

import { CheckUser } from "@/entities/user/model/check-user";
import { SolutionEditorForm } from "@/components/editor/solution-editor-form";
import { useAdminSecret } from "@/hooks/use-admin-secret";

export default function NewSolutionPage() {
  const { secret } = useAdminSecret();
  return (
    <CheckUser>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-display-2 mb-1">Новое решение</h1>
          <p className="text-body-3 text-(--on-bg-medium)">
            Заполните данные. Можно выбрать кастомную страницу.
          </p>
        </div>
        <SolutionEditorForm
          editing={null}
          redirectAfter={`/admin/${secret || ""}/solutions`}
        />
      </div>
    </CheckUser>
  );
}
