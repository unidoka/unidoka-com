"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { $fetch } from "@/utils/fetch";
import { toast } from "sonner";
import { CircleNotchIcon } from "@phosphor-icons/react";
interface Stats {
  total_users: number;
  total_orders: number;
  total_projects: number;
  total_companies: number;
  total_articles?: number;
  total_team_members?: number;
  orders_this_month?: number;
  projects_by_category?: Record<string, number>;
}
export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await $fetch("/api/v1/admin/dashboard", { isToast: false });
      if (res?.response?.status === 401) { router.push("/login"); return; }
      if (!res?.response?.ok) {
        setError(res?.json?.detail || "Failed to load data");
        return;
      }
      setStats(res.json);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { if (user) fetchStats(); }, [user]);
  if (isLoading || !user) return null;
  if (user.role !== "admin" && user.role !== "root") {
    toast.error("Доступ запрещён");
    router.push("/");
    return null;
  }
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-display-2 mb-1">Панель управления</h2>
        <p className="text-body-3 text-(--on-bg-medium)">Обзор ключевых метрик</p>
      </div>
      {loading && (
        <Card className="rounded-3xl border-(--outline) p-10 text-center">
          <CircleNotchIcon className="size-5 animate-spin mx-auto text-(--on-bg-low)" />
        </Card>
      )}
      {error && (
        <Card className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6">
          <p className="text-destructive mb-3">{error}</p>
          <Button variant="outlined" size="small" onClick={fetchStats}>Повторить</Button>
        </Card>
      )}
      {!loading && !error && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Пользователи" value={stats.total_users} />
          <Stat label="Заявки" value={stats.total_orders} sub={stats.orders_this_month != null ? `в этом месяце: ${stats.orders_this_month}` : undefined} />
          <Stat label="Проекты" value={stats.total_projects} />
          <Stat label="Компании" value={stats.total_companies} />
          {stats.total_articles != null && <Stat label="Статьи" value={stats.total_articles} />}
          {stats.total_team_members != null && <Stat label="Команда" value={stats.total_team_members} />}
        </div>
      )}
    </div>
  );
}
function Stat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <Card className="rounded-3xl border-(--outline) p-6">
      <p className="text-[11px] uppercase tracking-wider text-(--on-bg-low) mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold tracking-tighter">{value}</span>
        {sub && <span className="text-xs text-(--on-bg-low)">{sub}</span>}
      </div>
    </Card>
  );
}
