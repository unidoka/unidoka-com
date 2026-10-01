"use client";
import { use, useEffect, useState } from "react";
import { CheckUser } from "@/entities/user/model/check-user";
import { Card } from "@/components/ui/card";
import { CircleNotchIcon, WarningIcon } from "@phosphor-icons/react";
import { fetchAdminEvent, type EventDetail, type EventPayload } from "@/utils/api/events";
import { Container } from "@/components/ui/container";
export default function EditEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setLoading(true);
    fetchAdminEvent(slug)
      .then((e) => { if (!e) setError("Событие не найдено"); else setEvent(e); })
      .catch((err) => setError(err?.message || "Ошибка"))
      .finally(() => setLoading(false));
  }, [slug]);
  return (
    <CheckUser>
      {loading ? (
        <Card className="rounded-3xl border-(--outline) p-10 text-center"><CircleNotchIcon className="size-5 animate-spin mx-auto text-(--on-bg-low)" /></Card>
      ) : event ? (
        <Card className="rounded-3xl border-(--outline) p-6 max-w-2xl">
          <h1 className="text-display-2 mb-2">{event.title}</h1>
          <p className="text-body-4 text-(--on-bg-low)">Slug: {event.slug}</p>
          <p className="text-body-3 text-(--on-bg-medium) mt-4">
            Форма редактирования события. Скопируй event-editor-form из donor-репо:
            <code className="block mt-2 p-2 bg-(--bg) rounded text-body-5">components/editor/event-editor-form.tsx</code>
          </p>
        </Card>
      ) : (
        <Card className="rounded-3xl border border-rose-500/30 bg-rose-500/5 p-6 max-w-2xl">
          <div className="flex items-start gap-4">
            <WarningIcon className="size-5 text-rose-500 shrink-0" />
            <div><h2 className="text-heading-4 mb-1">{error || "Не найдено"}</h2><code className="text-body-5 font-mono text-(--on-bg-low)">{slug}</code></div>
          </div>
        </Card>
      )}
    </CheckUser>
  );
}
