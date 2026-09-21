"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { $fetch } from "@/utils/fetch";
import { toast } from "sonner";

interface Stats {
  total_users: number;
  total_orders: number;
  total_projects: number;
  total_companies: number;
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
    const res = await $fetch("/api/v1/admin/dashboard", { isToast: false });

    if (res.response?.status === 401) {
      router.push("/login");
      return;
    }

    if (res.response && res.response.status >= 500) {
      setError("Server error. Please try again later.");
      toast.error(error || "Server error");
      setLoading(false);
      return;
    }

    if (!res.response?.ok) {
      setError(res.json?.detail || "Failed to load data");
      setLoading(false);
      return;
    }

    setStats(res.json);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    fetchStats();
  }, [user]);

  if (isLoading || !user) return null;

  if (user.role !== "admin" && user.role !== "root") {
    return <p className="text-destructive">Access denied</p>;
  }

  return (
    <div>
      <h2 className="text-display-2 mb-4">Dashboard</h2>
      {loading && <p>Loading...</p>}
      {error && (
        <div className="flex items-center gap-4">
          <p className="text-destructive">{error}</p>
          <Button variant="outlined" onClick={fetchStats}>Retry</Button>
        </div>
      )}
      {!loading && !error && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Users" value={stats.total_users} />
          <StatCard label="Orders" value={stats.total_orders} />
          <StatCard label="Projects" value={stats.total_projects} />
          <StatCard label="Companies" value={stats.total_companies} />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </Card>
  );
}
