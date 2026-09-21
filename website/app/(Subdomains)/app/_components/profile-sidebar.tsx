"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser } from "@/entities/user/model/user-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SignOut, User, Gear, Briefcase } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function ProfileSidebar() {
  const pathname = usePathname();
  const { logout } = useUser();
  const router = useRouter();
  const [domain, setDomain] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDomain(window.location.hostname);
    }
  }, []);

  // TODO: move to the app. subdomain
  const navItems = [
    { label: "Профиль", href: `/app/profile`, icon: User },
    { label: "Настройки", href: `/app/profile/Gear`, icon: Gear },
    { label: "Безопасность", href: `/app/profile/security`, icon: Briefcase },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <aside className="w-full md:w-64 shrink-0 h-fit rounded-3xl border border-(--outline) bg-(--card) p-6 shadow-md transition-all">
      <div className="mb-6 pb-6 border-b border-(--outline)">
        <h2 className="text-heading-3">Личный кабинет</h2>
      </div>
      <nav className="flex flex-col space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-(--primary-glass) text-(--primary) font-medium"
                  : "text-(--on-bg-medium) hover:bg-(--state-hover)"
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span className="text-body-4">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-(--on-bg-medium) hover:bg-(--state-hover)"
        >
          <SignOut className="size-5 shrink-0" />
          <span className="text-sm">Выйти</span>
        </button>
      </nav>
    </aside>
  );
}
