"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  CalendarBlank,
  MapPin,
  User as UserIcon,
} from "@phosphor-icons/react";
import { colorForOrganizer } from "./organizer-meta";
import type { EventListItem } from "@/utils/api/events";

interface Props {
  event: EventListItem | null;
  onOpenChange: (open: boolean) => void;
}

export function EventDetails({ event, onOpenChange }: Props) {
  const open = event !== null;
  if (!event) {
    return (
      <Dialog open={false} onOpenChange={onOpenChange}>
        <DialogContent />
      </Dialog>
    );
  }

  const color = colorForOrganizer(event.organizer);
  const start = event.start_at ? new Date(event.start_at) : null;
  const end = event.end_at ? new Date(event.end_at) : null;
  const author = event.submitted_by;
  const authorName = author
    ? [author.name, author.surname].filter(Boolean).join(" ").trim() ||
      (author.username ? "@" + author.username : null)
    : null;
  const authorHref = author?.username ? `/u/${author.username}` : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {event.organizer && (
            <div
              className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider mb-2"
              style={{
                color,
                backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
              }}
            >
              <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
              {event.organizer.name}
            </div>
          )}
          <DialogTitle className="text-heading-2 leading-tight">{event.title}</DialogTitle>
          {event.short_description && (
            <DialogDescription className="text-body-4">
              {event.short_description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex flex-wrap gap-1.5 mt-2">
          {(event.types ?? []).map((a) =>
            a.type ? (
              <Badge key={a.id} variant="tonal-card-static">
                {a.type.name}
              </Badge>
            ) : a.custom_name ? (
              <Badge key={a.id} variant="tonal-card-static">
                {a.custom_name}
              </Badge>
            ) : null,
          )}
          {event.is_featured && (
            <Badge variant="tonal-card-static">★ Избранное</Badge>
          )}
          {event.city && <Badge variant="tonal-card-static">{event.city}</Badge>}
        </div>

        <div className="flex flex-col gap-2 text-body-4 text-(--on-bg-medium) mt-4">
          {start && (
            <Row icon={<CalendarBlank className="size-4" />}>
              {format(start, "d MMMM yyyy", { locale: ru })}
              {end && ` — ${format(end, "d MMMM yyyy", { locale: ru })}`}
            </Row>
          )}
          {event.location_name && (
            <Row icon={<MapPin className="size-4" />}>{event.location_name}</Row>
          )}
          {authorName && (
            <Row icon={<UserIcon className="size-4" />}>
              {authorHref ? (
                <Link href={authorHref} className="text-(--primary) hover:underline">
                  {authorName}
                </Link>
              ) : (
                authorName
              )}
            </Row>
          )}
        </div>

        {(event.tags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {(event.tags ?? []).map((tag) => (
              <Badge key={tag.id} variant="tonal-card-static">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="text" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
          {event.registration_url && (
            <Button asChild>
              <a href={event.registration_url} target="_blank" rel="noopener noreferrer">
                Зарегистрироваться
                <ArrowUpRight />
              </a>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-(--on-bg-low)">{icon}</span>
      <span>{children}</span>
    </div>
  );
}
