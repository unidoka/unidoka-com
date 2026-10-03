"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowClockwiseIcon,
  ArrowUpRightIcon,
  Buildings,
  CalendarBlank,
  CircleNotchIcon,
  Cube,
  NewspaperIcon,
  Receipt,
  Users,
  UsersThree,
} from "@phosphor-icons/react";
import { useUser } from "@/entities/user/model/user-context";
import { Button } from "@/components/ui/button";
import { $fetch } from "@/utils/fetch";
import { cn } from "@/lib/utils";
import { useAdminSecret } from "@/hooks/use-admin-secret";

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

  const base = secret ? `/admin/${secret}` : "/admin";

  return (
    <div className="space-y-4">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-3 pb-3 border-b border-(--outline)">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-(--on-bg-low) mb-1.5">
            {new Date().toLocaleDateString("ru-RU", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h1 className="text-display-3 font-semibold tracking-tight text-(--on-bg-high) leading-none">
            Обзор
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <RangeTabs
            value={days}
            onChange={setDays}
            disabled={state.kind === "loading"}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={() => load(days)}
            disabled={state.kind === "loading"}
          >
            <ArrowClockwiseIcon
              className={cn(
                "size-3.5",
                state.kind === "loading" && "animate-spin",
              )}
            />
          </Button>
        </div>
      </div>

      {/* ── Error ──────────────────────────────────────────────── */}
      {state.kind === "error" && (
        <div className="rounded-2xl border border-[color-mix(in_srgb,var(--error),transparent_70%)] bg-[color-mix(in_srgb,var(--error),transparent_94%)] p-4">
          <p className="text-body-4 font-medium text-(--error) mb-1">
            Не удалось загрузить статистику
          </p>
          <p className="text-body-5 text-(--on-bg-medium) mb-3">
            {state.message}
            {state.status ? ` · HTTP ${state.status}` : ""}
          </p>
          <Button variant="outlined" size="small" onClick={() => load(days)}>
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

/* ─── Ready view ─────────────────────────────────────────────────── */
function ReadyView({
  stats,
  series,
  base,
}: {
  stats: Stats;
  series: Point[];
  base: string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          <ChartPanel series={series} />
        </div>
        <KpiPanel stats={stats} />
      </div>

      <MetricStrip stats={stats} base={base} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <WideTile
          label="Заявки"
          value={stats.total_orders}
          sub={
            stats.orders_this_month
              ? `+${stats.orders_this_month} за месяц`
              : "нет за месяц"
          }
          icon={Receipt}
          href={`${base}/orders`}
        />
        <WideTile
          label="Команда"
          value={stats.total_team_members ?? 0}
          sub="активных участников"
          icon={UsersThree}
          href={`${base}/team`}
        />
        <WideTile
          label="События"
          value={stats.total_events ?? 0}
          sub="в системе"
          icon={CalendarBlank}
          href={`${base}/events`}
          className="sm:col-span-2 lg:col-span-1"
        />
      </div>
    </div>
  );
}

/* ─── Chart ──────────────────────────────────────────────────────── */
function ChartPanel({ series }: { series: Point[] }) {
  const [active, setActive] = useState<"users" | "orders" | null>(null);

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
    <div className="rounded-2xl border border-(--outline) bg-(--card) h-full flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-(--outline)">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-(--on-bg-low)">
            Activity
          </p>
          <p className="text-body-3 font-medium text-(--on-bg-high) mt-0.5">
            Активность за период
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <LegendChip
            label="Пользователи"
            color="var(--on-bg-high)"
            value={usersTotal}
            active={active === "users"}
            onHover={setActive}
            series="users"
          />
          <LegendChip
            label="Заявки"
            color="var(--on-bg-low)"
            value={ordersTotal}
            active={active === "orders"}
            onHover={setActive}
            series="orders"
          />
        </div>
      </div>
      <div className="flex-1 px-2 pt-3 pb-2 min-h-[220px] sm:min-h-[260px] lg:min-h-[300px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-body-4 text-(--on-bg-low)">
            Нет данных за период
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 4, right: 12, bottom: 4, left: -16 }}
            >
              <defs>
                <linearGradient id="grad-users" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--on-bg-high)"
                    stopOpacity={0.28}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--on-bg-high)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="grad-orders" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--on-bg-low)"
                    stopOpacity={0.22}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--on-bg-low)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="var(--outline)"
                strokeDasharray="0"
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
              <Area
                type="monotone"
                dataKey="users"
                name="Пользователи"
                stroke="var(--on-bg-high)"
                strokeWidth={1.75}
                fill="url(#grad-users)"
                fillOpacity={active === "orders" ? 0.15 : 1}
                strokeOpacity={active === "orders" ? 0.3 : 1}
                isAnimationActive={false}
                dot={false}
                activeDot={{
                  r: 3.5,
                  stroke: "var(--on-bg-high)",
                  strokeWidth: 2,
                  fill: "var(--bg)",
                }}
              />
              <Area
                type="monotone"
                dataKey="orders"
                name="Заявки"
                stroke="var(--on-bg-low)"
                strokeWidth={1.75}
                fill="url(#grad-orders)"
                fillOpacity={active === "users" ? 0.15 : 1}
                strokeOpacity={active === "users" ? 0.3 : 1}
                isAnimationActive={false}
                dot={false}
                activeDot={{
                  r: 3.5,
                  stroke: "var(--on-bg-low)",
                  strokeWidth: 2,
                  fill: "var(--bg)",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function LegendChip({
  label,
  color,
  value,
  active,
  onHover,
  series,
}: {
  label: string;
  color: string;
  value: number;
  active: boolean;
  onHover: (s: "users" | "orders" | null) => void;
  series: "users" | "orders";
}) {
  return (
    <button
      type="button"
      onMouseEnter={() => onHover(series)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-2 py-1 transition-colors",
        active
          ? "border-(--outline) bg-(--state-hover)"
          : "border-transparent hover:bg-(--state-hover)",
      )}
    >
      <span
        className="size-2 rounded-full shrink-0"
        style={{ background: color }}
      />
      <span className="text-body-5 text-(--on-bg-medium)">{label}</span>
      <span className="font-mono text-body-5 text-(--on-bg-high) font-medium tabular-nums">
        {value}
      </span>
    </button>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-(--outline) bg-(--card) px-2.5 py-2 shadow-lg">
      <p className="text-[10px] uppercase tracking-wider text-(--on-bg-low) mb-1.5">
        {label}
      </p>
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
          <span className="font-mono text-(--on-bg-high) font-medium ml-auto pl-3 tabular-nums">
            {p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── KPI rail — monochrome tiles ────────────────────────────────── */
function KpiPanel({ stats }: { stats: Stats }) {
  const rows = [
    { label: "Пользователи", value: stats.total_users, icon: Users },
    { label: "Заявки всего", value: stats.total_orders, icon: Receipt },
    {
      label: "Заявок в месяце",
      value: stats.orders_this_month ?? 0,
      icon: Receipt,
    },
    { label: "Компании", value: stats.total_companies, icon: Buildings },
  ];

  return (
    <div className="rounded-2xl border border-(--outline) bg-(--card) flex flex-col">
      <div className="px-4 py-3 border-b border-(--outline)">
        <p className="text-[10px] uppercase tracking-[0.18em] text-(--on-bg-low)">
          Key metrics
        </p>
        <p className="text-body-3 font-medium text-(--on-bg-high) mt-0.5">
          Ключевые показатели
        </p>
      </div>
      <div className="flex-1 divide-y divide-(--outline)">
        {rows.map((r) => {
          const Icon = r.icon;
          return (
            <div
              key={r.label}
              className="flex items-center gap-3 px-4 py-3 hover:bg-(--state-hover) transition-colors"
            >
              {/* Monochrome tile — inverted fill, matches the home-page
                  numbers section: solid on-bg-high on the tile, on-bg bg
                  for the glyph. No color, no gradient. */}
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-(--on-bg-high) text-(--bg)">
                <Icon className="size-3.5" weight="bold" />
              </span>
              <span className="flex-1 text-body-4 text-(--on-bg-medium) truncate">
                {r.label}
              </span>
              <span className="font-mono text-[15px] font-semibold text-(--on-bg-high) tabular-nums">
                {r.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Metric strip ───────────────────────────────────────────────── */
function MetricStrip({ stats, base }: { stats: Stats; base: string }) {
  const tiles: {
    label: string;
    value: number;
    icon: React.ComponentType<{ className?: string; weight?: "bold" | "regular" }>;
    href: string;
  }[] = [
    {
      label: "Компании",
      value: stats.total_companies,
      icon: Buildings,
      href: `${base}/companies`,
    },
    {
      label: "Проекты",
      value: stats.total_projects,
      icon: Cube,
      href: `${base}/projects`,
    },
    {
      label: "События",
      value: stats.total_events ?? 0,
      icon: CalendarBlank,
      href: `${base}/events`,
    },
    {
      label: "Статьи",
      value: stats.total_articles ?? 0,
      icon: NewspaperIcon,
      href: `${base}/articles`,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {tiles.map((t) => {
        const Icon = t.icon;
        return (
          <Link key={t.label} href={t.href} className="group block">
            <div className="rounded-2xl border border-(--outline) bg-(--card) p-3.5 transition-colors group-hover:border-(--on-bg-low)">
              <div className="flex items-center justify-between mb-3">
                <span className="flex size-7 items-center justify-center rounded-md bg-(--on-bg-high) text-(--bg)">
                  <Icon className="size-3.5" weight="bold" />
                </span>
                <ArrowUpRightIcon className="size-3 text-(--on-bg-low) opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-(--on-bg-low) mb-1 truncate">
                {t.label}
              </p>
              <p className="font-mono text-[1.5rem] font-semibold leading-none text-(--on-bg-high) tabular-nums">
                {t.value}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/* ─── Wide tile ──────────────────────────────────────────────────── */
function WideTile({
  label,
  value,
  sub,
  icon: Icon,
  href,
  className,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: React.ComponentType<{ className?: string; weight?: "bold" | "regular" }>;
  href: string;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("group block", className)}>
      <div className="rounded-2xl border border-(--outline) bg-(--card) p-4 transition-colors group-hover:border-(--on-bg-low) h-full">
        <div className="flex items-center justify-between mb-4">
          <span className="flex size-8 items-center justify-center rounded-md bg-(--on-bg-high) text-(--bg)">
            <Icon className="size-4" weight="bold" />
          </span>
          <ArrowUpRightIcon className="size-3.5 text-(--on-bg-low) opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.14em] text-(--on-bg-low) mb-1.5 truncate">
          {label}
        </p>
        <p className="font-mono text-[2rem] font-semibold leading-none text-(--on-bg-high) tabular-nums mb-2">
          {value}
        </p>
        {sub && (
          <p className="text-body-5 text-(--on-bg-low) truncate">{sub}</p>
        )}
      </div>
    </Link>
  );
}

/* ─── Range tabs ─────────────────────────────────────────────────── */
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
    <div className="inline-flex rounded-lg border border-(--outline) bg-(--card) p-0.5">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          disabled={disabled}
          onClick={() => onChange(o.v)}
          className={cn(
            "px-2.5 py-1 text-body-5 font-medium rounded-md transition-colors",
            value === o.v
              ? "bg-(--on-bg-high) text-(--bg)"
              : "text-(--on-bg-medium) hover:text-(--on-bg-high) hover:bg-(--state-hover)",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────── */
function LoadingGrid() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 rounded-2xl border border-(--outline) bg-(--card) h-[340px] animate-pulse" />
        <div className="rounded-2xl border border-(--outline) bg-(--card) h-[340px] animate-pulse" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-(--outline) bg-(--card) h-[92px] animate-pulse"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-(--outline) bg-(--card) h-[124px] animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
