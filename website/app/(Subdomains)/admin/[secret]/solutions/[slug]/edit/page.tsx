"use client";

import { use, useEffect, useState } from "react";
import { CheckUser } from "@/entities/user/model/check-user";
import { Card } from "@/components/ui/card";
import { CircleNotchIcon, WarningIcon } from "@phosphor-icons/react";
import { fetchAdminSolution, type Solution } from "@/utils/api/solutions";
import { SolutionEditorForm } from "@/components/editor/solution-editor-form";
import { useAdminSecret } from "@/hooks/use-admin-secret";

export default function EditSolutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { secret } = useAdminSecret();
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchAdminSolution(slug)
      .then((s) => {
        if (!s) setError("Решение не найдено");
        else setSolution(s);
      })
      .catch((err) => setError(err?.message || "Ошибка"))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <CheckUser>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-display-2 mb-1">Редактирование</h1>
          <p className="text-body-3 text-(--on-bg-medium) font-mono">/solutions/{slug}</p>
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
        {solution && (
          <SolutionEditorForm
            editing={solution}
            redirectAfter={`/admin/${secret || ""}/solutions`}
          />
        )}
      </div>
    </CheckUser>
  );
}
