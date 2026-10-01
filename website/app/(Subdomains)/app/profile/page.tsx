"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useUser } from "@/entities/user/model/user-context";
export default function ProfilePage() {
  const { user } = useUser();
  if (!user) return null;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display-2 mb-1">Профиль</h1>
        <p className="text-body-3 text-(--on-bg-medium)">Управление аккаунтом</p>
      </div>
      <Card className="rounded-3xl border-(--outline) p-6 space-y-2">
        <p className="text-body-5 uppercase tracking-wider text-(--on-bg-low)">Email</p>
        <p className="text-body-2 text-(--on-bg-high)">{user.email}</p>
        <p className="text-body-5 uppercase tracking-wider text-(--on-bg-low) mt-4">Имя</p>
        <p className="text-body-2 text-(--on-bg-high)">{user.name || "—"}</p>
      </Card>
    </div>
  );
}
