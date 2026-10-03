"use client";

import { CheckUser } from "@/entities/user/model/check-user";
import { EventEditorForm } from "@/components/editor/event-editor-form";
import { useAdminSecret } from "@/hooks/use-admin-secret";

export default function NewEventPage() {
  const { secret } = useAdminSecret();
  return (
    <CheckUser>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-display-2 mb-1">Новое событие</h1>
          <p className="text-body-3 text-(--on-bg-medium)">
            Создание события от имени администратора — сразу попадает в календарь.
          </p>
        </div>
        <EventEditorForm
          editing={null}
          mode="admin"
          redirectAfter={`/admin/${secret || ""}/events`}
        />
      </div>
    </CheckUser>
  );
}
