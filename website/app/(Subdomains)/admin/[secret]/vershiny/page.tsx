"use client";

import { CheckUser } from "@/entities/user/model/check-user";
import { Card } from "@/components/ui/card";
import {
  Users,
  GraduationCap,
  Ticket,
  Trophy,
  ChartLineUp,
} from "@phosphor-icons/react";

/**
 * Vershiny admin — placeholder dashboard.
 *
 * The program has three moving parts that will each get their own
 * stats panel once the data model exists:
 *   • Participants  — users flagged as Vershiny members
 *   • Mentors       — users with the mentor role
 *   • Requests      — applications to events / the program itself
 *
 * Every tile below is a static zero. When the backend endpoints land,
 * they render real counts and the two chart panels fill in with
 * timeseries — same pattern as /admin (the main dashboard): area chart
 * for activity, KPI rail for point-in-time totals.
 */
export default function VershinyPage() {
  const tiles = [
    { label: "Участники", value: 0, icon: Users },
    { label: "Менторы", value: 0, icon: GraduationCap },
    { label: "Заявки", value: 0, icon: Ticket },
    { label: "Событий", value: 0, icon: Trophy },
  ];

  return (
    <CheckUser>
      <div className="space-y-6">
        <div>
          <h1 className="text-display-2 mb-1">Вершины</h1>
          <p className="text-body-3 text-(--on-bg-medium)">
            Программа развития специалистов — участники, менторы, заявки
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {tiles.map((t) => {
            const Icon = t.icon;
            return (
              <Card
                key={t.label}
                className="rounded-2xl border border-(--outline) bg-(--card) ring-0 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="flex size-7 items-center justify-center rounded-md bg-(--on-bg-high) text-(--bg)">
                    <Icon className="size-3.5" weight="bold" />
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-(--on-bg-low) mb-1 truncate">
                  {t.label}
                </p>
                <p className="font-mono text-[1.5rem] font-semibold leading-none text-(--on-bg-high) tabular-nums">
                  {t.value}
                </p>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Card className="rounded-2xl border border-(--outline) bg-(--card) ring-0 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex size-7 items-center justify-center rounded-md bg-(--on-bg-high) text-(--bg)">
                <ChartLineUp className="size-3.5" weight="bold" />
              </span>
              <div>
                <p className="text-body-3 font-medium text-(--on-bg-high)">
                  Динамика участников
                </p>
                <p className="text-body-5 text-(--on-bg-low)">
                  Здесь будет график роста
                </p>
              </div>
            </div>
            <div className="h-[180px] rounded-lg border border-dashed border-(--outline) flex items-center justify-center text-body-5 text-(--on-bg-low)">
              Данные появятся после подключения API
            </div>
          </Card>

          <Card className="rounded-2xl border border-(--outline) bg-(--card) ring-0 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex size-7 items-center justify-center rounded-md bg-(--on-bg-high) text-(--bg)">
                <Ticket className="size-3.5" weight="bold" />
              </span>
              <div>
                <p className="text-body-3 font-medium text-(--on-bg-high)">
                  Заявки по направлениям
                </p>
                <p className="text-body-5 text-(--on-bg-low)">
                  Разбивка по поднаправлениям
                </p>
              </div>
            </div>
            <div className="h-[180px] rounded-lg border border-dashed border-(--outline) flex items-center justify-center text-body-5 text-(--on-bg-low)">
              Данные появятся после подключения API
            </div>
          </Card>
        </div>
      </div>
    </CheckUser>
  );
}
