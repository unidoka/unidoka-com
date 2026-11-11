"use client";

import Link from "next/link";
import { format, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  CalendarBlank,
  MapPin,
  User as UserIcon,
  Clock,
  Tag,
} from "@phosphor-icons/react";
import { colorForOrganizer } from "./organizer-meta";
import type { EventListItem } from "@/utils/api/events";
import { cn } from "@/lib/utils";

interface Props {
  event: EventListItem | null;
  onOpenChange: (open: boolean) => void;
}

// Renders HTML safely for the modal body
function HtmlRenderer({ html, className }: { html: string; className?: string }) {
  if (!html) return null;
  const sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  return (
    <div 
      className={cn(
        "max-w-none break-words text-body-3 leading-relaxed text-(--on-bg-medium)",
        "[&_a]:text-(--primary) [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:opacity-80",
        "[&_br]:block [&_br]:content-[''] [&_br]:mt-2",
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitized }} 
    />
  );
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
    ? [author.name, author.surname].filter(Boolean).join(" ").trim() || (author.username ? "@" + author.username : null)
    : null;
  const authorHref = author?.username ? `/u/${author.username}` : null;

  // Date Logic fix
  const sameDay = start && end ? isSameDay(start, end) : false;
  let dateLabel = "";
  let timeLabel = "";
  
  if (start) {
    if (sameDay) {
      dateLabel = format(start, "d MMMM yyyy", { locale: ru });
      timeLabel = end ? `${format(start, "HH:mm")} — ${format(end, "HH:mm")}` : format(start, "HH:mm");
    } else if (end) {
      dateLabel = `${format(start, "d MMMM", { locale: ru })} — ${format(end, "d MMMM yyyy", { locale: ru })}`;
      timeLabel = `${format(start, "HH:mm")} — ${format(end, "HH:mm")}`;
    } else {
      dateLabel = format(start, "d MMMM yyyy", { locale: ru });
      timeLabel = format(start, "HH:mm");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border-(--outline) bg-(--card) shadow-xl">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2 mb-2">
            {event.organizer && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-(--on-bg-medium)">
                <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
                {event.organizer.name}
              </span>
            )}
            {event.is_featured && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-(--primary)">
                ★
              </span>
            )}
          </div>
          
          <DialogTitle className="text-2xl font-heading font-medium tracking-tight leading-tight">
            {event.title.replace(/<[^>]*>?/gm, '')}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          {/* Description */}
          {event.short_description && (
            <HtmlRenderer html={event.short_description} />
          )}

          {/* Metadata List */}
          <div className="flex flex-col gap-3 py-4 border-y border-(--outline)">
            {start && (
              <div className="flex items-start gap-3">
                <CalendarBlank className="size-5 text-(--on-bg-low) shrink-0 mt-0.5" weight="fill" />
                <div>
                  <p className="text-body-4 font-medium text-(--on-bg-high)">{dateLabel}</p>
                  <p className="text-body-5 text-(--on-bg-medium) flex items-center gap-1.5 mt-0.5">
                    <Clock className="size-3.5" /> {timeLabel}
                  </p>
                </div>
              </div>
            )}

            {event.location_name && (
              <div className="flex items-start gap-3">
                <MapPin className="size-5 text-(--on-bg-low) shrink-0 mt-0.5" weight="fill" />
                <div>
                  <HtmlRenderer 
                    html={event.location_name} 
                    className="text-body-4 font-medium text-(--on-bg-high) leading-snug" 
                  />
                  {event.city && <p className="text-body-5 text-(--on-bg-medium) mt-0.5">{event.city}</p>}
                </div>
              </div>
            )}

            {authorName && (
              <div className="flex items-start gap-3">
                <UserIcon className="size-5 text-(--on-bg-low) shrink-0 mt-0.5" weight="fill" />
                <div>
                  <p className="text-body-4 font-medium text-(--on-bg-high)">
                    {authorHref ? (
                      <Link href={authorHref} className="hover:text-(--primary) transition-colors">
                        {authorName}
                      </Link>
                    ) : (
                      authorName
                    )}
                  </p>
                  <p className="text-body-5 text-(--on-bg-medium) mt-0.5">Организатор</p>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {((event.tags ?? []).length > 0 || (event.types ?? []).length > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {(event.types ?? []).map((t) => 
                t.type ? (
                  <span key={t.id} className="text-[11px] font-medium text-(--on-bg-medium) px-2 py-1 rounded-md border border-(--outline) bg-(--bg)">
                    {t.type.name}
                  </span>
                ) : t.custom_name ? (
                  <span key={t.id} className="text-[11px] font-medium text-(--on-bg-medium) px-2 py-1 rounded-md border border-(--outline) bg-(--bg)">
                    {t.custom_name}
                  </span>
                ) : null
              )}
              {(event.tags ?? []).map((tag) => (
                <span key={tag.id} className="text-[11px] font-medium text-(--on-bg-medium) px-2 py-1 rounded-md border border-(--outline) bg-(--bg)">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 bg-(--bg) border-t border-(--outline) flex-col sm:flex-row sm:justify-between items-center gap-3">
          <Button variant="text" onClick={() => onOpenChange(false)} className="w-full sm:w-auto order-2 sm:order-1">
            Закрыть
          </Button>
          {event.registration_url && (
            <Button asChild className="w-full sm:w-auto order-1 sm:order-2">
              <a href={event.registration_url} target="_blank" rel="noopener noreferrer">
                Регистрация
                <ArrowUpRight className="size-4 ml-1.5" />
              </a>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
