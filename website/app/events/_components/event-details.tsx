"use client";
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
  Trophy,
  Users,
  CheckCircle,
  XCircle,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { colorForOrganizer } from "./organizer-meta";
import { TYPE_LABEL, type EventItem } from "../_data/events";

interface Props {
  event: EventItem | null;
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
  const start = new Date(event.startsAt);
  const end = event.endsAt ? new Date(event.endsAt) : null;

  const ageLabel =
    event.ageMin && event.ageMax
      ? `${event.ageMin}–${event.ageMax} лет`
      : event.ageMin
        ? `от ${event.ageMin} лет`
        : event.ageMax
          ? `до ${event.ageMax} лет`
          : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div
            className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider mb-2"
            style={{
              color,
              backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
            }}
          >
            <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
            {event.organizer}
          </div>
          <DialogTitle className="text-heading-2 leading-tight">
            {event.title}
          </DialogTitle>
          <DialogDescription className="text-body-4">
            {event.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-1.5 mt-2">
          <Badge variant="tonal-card-static">{TYPE_LABEL[event.type]}</Badge>
          <Badge variant="tonal-card-static">{event.country}</Badge>
          {ageLabel && <Badge variant="tonal-card-static">{ageLabel}</Badge>}
          {event.registrationOpen ? (
            <Badge
              variant="tonal-card-static"
              className="text-(--success)!"
            >
              <CheckCircle className="size-3" /> Регистрация открыта
            </Badge>
          ) : (
            <Badge variant="tonal-card-static">
              <XCircle className="size-3" /> Регистрация закрыта
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-2 text-body-4 text-(--on-bg-medium) mt-4">
          <Row icon={<CalendarBlank className="size-4" />}>
            {format(start, "d MMMM yyyy", { locale: ru })}
            {end && ` — ${format(end, "d MMMM yyyy", { locale: ru })}`}
          </Row>
          {event.location && (
            <Row icon={<MapPin className="size-4" />}>{event.location}</Row>
          )}
          {ageLabel && (
            <Row icon={<Users className="size-4" />}>{ageLabel}</Row>
          )}
          {event.prize && (
            <Row icon={<Trophy className="size-4" />}>
              <span className="text-(--primary) font-medium">{event.prize}</span>
            </Row>
          )}
        </div>

        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {event.tags.map((tag) => (
              <Badge key={tag} variant="tonal-card-static">{tag}</Badge>
            ))}
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="text" onClick={() => onOpenChange(false)}>Закрыть</Button>
          {event.url && (
            <Button asChild disabled={!event.registrationOpen && false}>
              <a href={event.url} target="_blank" rel="noopener noreferrer">
                {event.registrationOpen ? "Зарегистрироваться" : "Подробнее"}
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
