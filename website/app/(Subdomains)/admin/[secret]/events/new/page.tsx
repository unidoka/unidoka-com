"use client";
import { CheckUser } from "@/entities/user/model/check-user";
import { Card } from "@/components/ui/card";
export default function NewEventPage() {
  return (
    <CheckUser>
      <Card className="rounded-3xl border-(--outline) p-6 max-w-2xl">
        <h1 className="text-display-2 mb-2">Новое событие</h1>
        <p className="text-body-3 text-(--on-bg-medium)">Скопируй EventEditorForm из donor-репо: <code>components/editor/event-editor-form.tsx</code></p>
      </Card>
    </CheckUser>
  );
}
