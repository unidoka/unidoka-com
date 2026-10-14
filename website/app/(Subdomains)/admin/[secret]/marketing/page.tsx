"use client";

import Link from "next/link";
import { CheckUser } from "@/entities/user/model/check-user";
import { Card } from "@/components/ui/card";
import {
  Megaphone,
  Wrench,
  ArrowRightIcon,
} from "@phosphor-icons/react";

/**
 * Marketing hub.
 *
 * Two entry points:
 *   /marketing/placements  — list of campaigns, create/edit dialogs
 *   /marketing/tools       — UTM builder, OG preview, slug generator
 *
 * The four placement types are still described here, but the actionable
 * content is a pair of nav cards. The placement-type explainer moved
 * into the editor's type picker, so it's visible where it's used
 * instead of as a static catalogue on this page.
 */
export default function MarketingPage() {
  return (
    <CheckUser permission="admin.marketing">
      <div className="space-y-6">
        <div>
          <h1 className="text-display-2 mb-1">Маркетинг</h1>
          <p className="text-body-3 text-(--on-bg-medium)">
            Кампании в интерфейсе и рабочие инструменты
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link href="/marketing/placements" className="block group">
            <Card className="rounded-2xl border border-(--outline) bg-(--card) ring-0 p-5 transition-colors group-hover:border-(--primary)/50 h-full">
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-(--on-bg-high) text-(--bg)">
                  <Megaphone className="size-5" weight="bold" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-heading-3 text-(--on-bg-high) mb-1">
                    Размещения
                  </p>
                  <p className="text-body-4 text-(--on-bg-medium) leading-snug mb-3">
                    Кампании на сайте: верхние полосы, карточки, уведомления,
                    модальные окна. Расписание и таргетинг по страницам.
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-body-4 font-medium text-(--primary) transition-transform group-hover:translate-x-0.5">
                    Открыть список
                    <ArrowRightIcon className="size-3.5" />
                  </span>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/marketing/tools" className="block group">
            <Card className="rounded-2xl border border-(--outline) bg-(--card) ring-0 p-5 transition-colors group-hover:border-(--primary)/50 h-full">
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-(--on-bg-high) text-(--bg)">
                  <Wrench className="size-5" weight="bold" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-heading-3 text-(--on-bg-high) mb-1">
                    Инструменты
                  </p>
                  <p className="text-body-4 text-(--on-bg-medium) leading-snug mb-3">
                    UTM-конструктор, превью для соцсетей и генератор слагов.
                    Клиентские утилиты без сохранения.
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-body-4 font-medium text-(--primary) transition-transform group-hover:translate-x-0.5">
                    Открыть инструменты
                    <ArrowRightIcon className="size-3.5" />
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </CheckUser>
  );
}
