"use client";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarBlank } from "@phosphor-icons/react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { colorForOrganizer } from "./organizer-meta";
import type { EventItem } from "../_data/events";

interface Props {
  day: Date | null;
  events: EventItem[];
  onClose: () => void;
  onSelectEvent: (e: EventItem) => void;
}

export function DayEventsDrawer({ day, events, onClose, onSelectEvent }: Props) {
  return (
    <Drawer open={day !== null} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="max-h-[80dvh]">
        <DrawerHeader>
          <DrawerTitle className="capitalize text-left">
            {day ? format(day, "d MMMM yyyy, EEEE", { locale: ru }) : ""}
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-8 flex flex-col gap-2 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-body-4 text-(--on-bg-medium) text-center py-10">
              Нет событий в этот день.
            </p>
          ) : (
            events.map((ev) => {
              const color = colorForOrganizer(ev.organizer);
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => {
                    onSelectEvent(ev);
                    onClose();
                  }}
                  style={{ borderLeft: `3px solid ${color}` }}
                  className="w-full text-left rounded-xl bg-(--card) border border-(--outline) p-3.5 transition-colors hover:border-(--primary) active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color }}
                    >
                      {ev.organizer}
                    </span>
                  </div>
                  <h4 className="text-heading-4 leading-tight">{ev.title}</h4>
                  {ev.location && (
                    <p className="text-body-5 text-(--on-bg-low) mt-1.5 inline-flex items-center gap-1">
                      <CalendarBlank className="size-3" />
                      {ev.location}
                    </p>
                  )}
                </button>
              );
            })
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
