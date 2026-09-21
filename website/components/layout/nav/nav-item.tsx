"use client";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import { RequestDemoDialog } from "@/components/marketing/request-demo-dialog";
import { AddEventDialog } from "@/components/marketing/add-event-dialog";
import { useHost } from "@/hooks/use-host";
import { resolveHref, type NavLinkItem } from "@/utils/constants/nav-links";
import { cn } from "@/lib/utils";

interface NavItemProps {
  item: NavLinkItem;
  variant: "header" | "panel";
  active?: boolean;
  onNavigate?: () => void;
}

export function NavItem({ item, variant, active, onNavigate }: NavItemProps) {
  const { urlFor } = useHost();

  const base =
    variant === "header"
      ? "transition-all duration-200"
      : "flex items-center justify-between px-4 py-3 rounded-2xl text-body-2 font-medium transition-colors w-full text-left";

  const styles = cn(
    base,
    active
      ? variant === "header"
        ? "text-(--primary)"
        : "bg-(--primary-glass) text-(--primary)"
      : variant === "header"
        ? "text-(--on-bg-high) hover:text-(--primary)"
        : "text-(--on-bg-high) hover:bg-(--state-hover)"
  );

  // Dialog triggers ---------------------------------------------------
  if (item.dialog === "request-demo") {
    return (
      <RequestDemoDialog>
        <button type="button" onClick={onNavigate} className={styles}>
          {item.label}
        </button>
      </RequestDemoDialog>
    );
  }
  if (item.dialog === "add-event") {
    return (
      <AddEventDialog>
        <button type="button" onClick={onNavigate} className={styles}>
          {item.label}
        </button>
      </AddEventDialog>
    );
  }

  // Links -------------------------------------------------------------
  const href = resolveHref(item, urlFor)!;
  const isExternal = !!item.target;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={styles}
    >
      <span>{item.label}</span>
      {isExternal && variant === "panel" && (
        <ArrowUpRight className="size-4 opacity-60" />
      )}
    </Link>
  );
}
