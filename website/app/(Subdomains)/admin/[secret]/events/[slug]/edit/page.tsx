"use client";

import { use, useEffect, useState } from "react";
import { CheckUser } from "@/entities/user/model/check-user";
import { Card } from "@/components/ui/card";
import { CircleNotchIcon, WarningIcon } from "@phosphor-icons/react";
import { fetchAdminEvent, type EventDetail } from "@/utils/api/events";
import { EventEditorForm } from "@/components/editor/event-editor-form";
import { useAdminSecret } from "@/hooks/use-admin-secret";

export default function EditEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { secret } = useAdminSecret();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchAdminEvent(slug)
      .then((e) => {
        if (!e) setError("Событие не найдено");
        else setEvent(e);
      })
      .catch((err) => setError(err?.message || "Ошибка"))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <CheckUser>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-display-2 mb-1">Редактирование</h1>
          <p className="text-body-3 text-(--on-bg-medium) font-mono">/events/{slug}</p>
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
        {event && (
          <EventEditorForm
            editing={event}
            mode="admin"
            redirectAfter={`/admin/${secret || ""}/events`}
          />
        )}
      </div>
    </CheckUser>
  );
}
