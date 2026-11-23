"use client";

import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { DotsThree } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface AdminPageAction {
  label: string;
  icon: ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
  external?: boolean;
  disabled?: boolean;
}

interface Props {
  title: string;
  meta?: ReactNode;
  primary?: AdminPageAction;
  actions?: AdminPageAction[];
}

export function AdminPageHeader({ title, meta, primary, actions = [] }: Props) {
  const PrimaryIcon = primary?.icon;

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="truncate text-heading-1 text-(--on-bg-high)">{title}</h1>
        {meta && (
          <p className="mt-1 text-body-5 text-(--on-bg-low)">{meta}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {primary && (
          <>
            {primary.href ? (
              <Button size="small" asChild>
                <Link
                  href={primary.href}
                  target={primary.external ? "_blank" : undefined}
                  rel={primary.external ? "noopener noreferrer" : undefined}
                >
                  {PrimaryIcon && <PrimaryIcon className="size-4" />}
                  {primary.label}
                </Link>
              </Button>
            ) : (
              <Button
                size="small"
                onClick={primary.onClick}
                disabled={primary.disabled}
              >
                {PrimaryIcon && <PrimaryIcon className="size-4" />}
                {primary.label}
              </Button>
            )}
          </>
        )}

        {actions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="text"
                size="icon-small"
                aria-label="Действия"
              >
                <DotsThree className="size-5" weight="bold" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[200px]">
              {actions.map((action) => {
                const Icon = action.icon;
                if (action.href) {
                  return (
                    <DropdownMenuItem
                      key={action.label}
                      asChild
                      className="gap-2 px-2 py-2 text-body-4"
                    >
                      <Link
                        href={action.href}
                        target={action.external ? "_blank" : undefined}
                        rel={action.external ? "noopener noreferrer" : undefined}
                      >
                        <Icon className="size-4" />
                        {action.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                }
                return (
                  <DropdownMenuItem
                    key={action.label}
                    onSelect={() => action.onClick?.()}
                    disabled={action.disabled}
                    className="gap-2 px-2 py-2 text-body-4"
                  >
                    <Icon className="size-4" />
                    {action.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
