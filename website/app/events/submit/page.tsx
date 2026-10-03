"use client";

import Link from "next/link";
import { CheckUser } from "@/entities/user/model/check-user";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { EventEditorForm } from "@/components/editor/event-editor-form";

export default function SubmitEventPage() {
  return (
    <CheckUser>
      <main className="min-h-screen bg-(--bg) pb-24">
        <section className="pt-20 sm:pt-28 pb-10 border-b border-(--outline)">
          <Container>
            <div className="max-w-[900px]">
              <p className="text-body-5 uppercase tracking-[0.3em] text-(--on-bg-low) mb-3">
                Событие
              </p>
              <h1 className="text-display-2 md:text-display-1 mb-4">
                Добавить событие
              </h1>
              <p className="text-body-2 text-(--on-bg-medium) leading-relaxed max-w-2xl">
                Заполните форму — событие отправится на модерацию. Обычно
                проверка занимает до 1 рабочего дня.
              </p>
            </div>
          </Container>
        </section>
        <section className="py-10 md:py-14">
          <Container>
            <div className="max-w-[900px]">
              <EventEditorForm
                editing={null}
                mode="user"
                redirectAfter="/events"
              />
            </div>
          </Container>
        </section>
      </main>
    </CheckUser>
  );
}
