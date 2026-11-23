"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowClockwiseIcon } from "@phosphor-icons/react";
import { useUser } from "@/entities/user/model/user-context";
import { Button } from "@/components/ui/button";
import { $fetch } from "@/utils/fetch";
import { cn } from "@/lib/utils";
import { useAdminSecret } from "@/hooks/use-admin-secret";
import { crossSubdomainUrl } from "@/utils/root-domain";

interface Stats {
  total_users: number;
  total_orders: number;
  total_projects: number;
  total_companies: number;
  total_articles?: number;
  total_events?: number;
  total_team_members?: number;
  orders_this_month?: number;
}

interface Point {
  date: string;
  users: number;
  orders: number;
}

type State =
  | { kind: "loading" }
  | { kind: "ready"; stats: Stats; series: Point[] }
  | { kind: "error"; message: string; status?: number };

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const { secret } = useAdminSecret();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [days, setDays] = useState<7 | 30 | 90>(30);

  const load = useCallback(
    async (range: number) => {
      setState({ kind: "loading" });
      try {
        const [statsRes, seriesRes] = await Promise.all([
          $fetch("/api/v1/admin/dashboard", { isToast: false }),
          $fetch(`/api/v1/admin/dashboard/timeseries?days=${range}`, {
            isToast: false,
          }),
        ]);
        if (statsRes?.response?.status === 401) {
          router.push("/login");
          return;
        }
        if (!statsRes?.response?.ok) {
          setState({
            kind: "error",
            message:
              typeof statsRes?.json?.detail === "string"
                ? statsRes.json.detail
                : `HTTP ${statsRes?.response?.status ?? "network"}`,
            status: statsRes?.response?.status,
          });
          return;
        }
        setState({
          kind: "ready",
          stats: statsRes.json as Stats,
          series: Array.isArray(seriesRes?.json)
            ? (seriesRes.json as Point[])
            : [],
        });
      } catch (err: any) {
        setState({ kind: "error", message: err?.message || "Network error" });
      }
    },
    [router],
  );

  useEffect(() => {
    if (user) load(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, days]);

  if (isLoading || !user) return null;
  if (user.role !== "admin" && user.role !== "root") {
    toast.error("Доступ запрещён");
    router.push("/");
    return null;
  }

  const base = secret ? crossSubdomainUrl("admin", `/${secret}`) : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-heading-1 text-(--on-bg-high)">Обзор</h1>
        <div className="flex items-center gap-2">
          <RangeTabs
            value={days}
            onChange={setDays}
            disabled={state.kind === "loading"}
          />
          <Button
            variant="text"
            size="icon-small"
            onClick={() => load(days)}
            disabled={state.kind === "loading"}
            aria-label="Обновить"
          >
            <ArrowClockwiseIcon
              className={cn(
                "size-4",
                state.kind === "loading" && "animate-spin",
              )}
            />
          </Button>
        </div>
      </div>

      {state.kind === "error" && (
        <div className="rounded-xl border border-(--outline) bg-(--card) p-4">
          <p className="text-body-4 text-(--on-bg-high)">
            Не удалось загрузить статистику
          </p>
          <p className="mt-1 text-body-5 text-(--on-bg-medium)">
            {state.message}
            {state.status ? ` · HTTP ${state.status}` : ""}
          </p>
          <Button
            variant="outlined"
            size="small"
            className="mt-3"
            onClick={() => load(days)}
          >
            Повторить
          </Button>
        </div>
      )}

      {state.kind === "loading" && <LoadingGrid />}
      {state.kind === "ready" && (
        <ReadyView stats={state.stats} series={state.series} base={base} />
      )}
    </div>
  );
}

function ReadyView({
  stats,
  series,
  base,
}: {
  stats: Stats;
  series: Point[];
  base: string;
}) {
  const metrics = [
    { label: "Пользователи", value: stats.total_users, href: `${base}/users` },
    { label: "Заявки", value: stats.total_orders, href: `${base}/orders` },
    { label: "Компании", value: stats.total_companies, href: `${base}/companies` },
    { label: "События", value: stats.total_events ?? 0, href: `${base}/events` },
    { label: "Решения", value: stats.total_projects, href: `${base}/solutions` },
    { label: "Статьи", value: stats.total_articles ?? 0, href: `${base}/articles` },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-(--outline) bg-(--outline) sm:grid-cols-3 lg:grid-cols-6">
        {metrics.map((m) => (
          <Link
            key={m.label}
            href={m.href}
            className="bg-(--card) p-4 transition-colors hover:bg-(--state-hover)"
          >
            <p className="truncate text-body-5 text-(--on-bg-low)">{m.label}</p>
            <p className="mt-2 font-mono text-[1.5rem] leading-none tabular-nums text-(--on-bg-high)">
              {m.value}
            </p>
          </Link>
        ))}
      </div>

      <ChartPanel series={series} />
    </div>
  );
}

function ChartPanel({ series }: { series: Point[] }) {
  const data = useMemo(
    () =>
      series.map((p) => ({
        ...p,
        label: new Date(p.date).toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "short",
        }),
      })),
    [series],
  );

  const usersTotal = useMemo(
    () => series.reduce((a, b) => a + b.users, 0),
    [series],
  );
  const ordersTotal = useMemo(
    () => series.reduce((a, b) => a + b.orders, 0),
    [series],
  );

  return (
    <div className="rounded-xl border border-(--outline) bg-(--card)">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--outline) px-4 py-3">
        <p className="text-body-4 text-(--on-bg-high)">Активность</p>
        <div className="flex items-center gap-4">
          <Legend label="Пользователи" value={usersTotal} />
          <Legend label="Заявки" value={ordersTotal} muted />
        </div>
      </div>
      <div className="h-[280px] px-2 py-3">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-body-4 text-(--on-bg-low)">
            Нет данных за период
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 4, right: 12, bottom: 4, left: -16 }}
            >
              <CartesianGrid
                stroke="var(--outline)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--on-bg-low)", fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "var(--outline)" }}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                tick={{ fill: "var(--on-bg-low)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={32}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ stroke: "var(--outline)", strokeWidth: 1 }}
                content={<ChartTooltip />}
              />
              <Line
                type="monotone"
                dataKey="users"
                name="Пользователи"
                stroke="var(--on-bg-high)"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3, fill: "var(--on-bg-high)" }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="orders"
                name="Заявки"
                stroke="var(--on-bg-low)"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3, fill: "var(--on-bg-low)" }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function Legend({
  label,
  value,
  muted,
}: {
  label: string;
  value: number;
  muted?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-body-5">
      <span
        className={cn(
          "size-1.5 rounded-full",
          muted ? "bg-(--on-bg-low)" : "bg-(--on-bg-high)",
        )}
      />
      <span className="text-(--on-bg-medium)">{label}</span>
      <span className="font-mono tabular-nums text-(--on-bg-high)">
        {value}
      </span>
    </span>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-(--outline) bg-(--card) px-3 py-2 shadow-lg">
      <p className="mb-1.5 text-body-5 text-(--on-bg-low)">{label}</p>
      {payload.map((p: any) => (
        <div
          key={p.dataKey}
          className="flex items-center gap-2 text-body-5 leading-tight"
        >
          <span
            className="size-1.5 rounded-full"
            style={{ background: p.stroke }}
          />
          <span className="text-(--on-bg-medium)">{p.name}</span>
          <span className="ml-auto pl-3 font-mono tabular-nums text-(--on-bg-high)">
            {p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function RangeTabs({
  value,
  onChange,
  disabled,
}: {
  value: 7 | 30 | 90;
  onChange: (v: 7 | 30 | 90) => void;
  disabled?: boolean;
}) {
  const options: { v: 7 | 30 | 90; label: string }[] = [
    { v: 7, label: "7д" },
    { v: 30, label: "30д" },
    { v: 90, label: "90д" },
  ];

  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg bg-(--state-hover) p-0.5">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          disabled={disabled}
          onClick={() => onChange(o.v)}
          className={cn(
            "rounded-md px-2.5 py-1 text-body-5 transition-colors",
            value === o.v
              ? "bg-(--card) text-(--on-bg-high)"
              : "text-(--on-bg-medium) hover:text-(--on-bg-high)",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-[84px] animate-pulse rounded-xl border border-(--outline) bg-(--card)"
          />
        ))}
      </div>
      <div className="h-[340px] animate-pulse rounded-xl border border-(--outline) bg-(--card)" />
    </div>
  );
}
