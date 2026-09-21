import type { Metadata } from "next";
import { headers } from "next/headers";
import EventsClientLayout from "./client-layout";

export const metadata: Metadata = {
  title: "События — Unidoka",
  description:
    "Конференции, форумы, соревнования, стажировки и практики от Unidoka",
};

export default async function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const host = (h.get("host") || "").split(":")[0];
  const isEventsHost = host.startsWith("events.");
  return (
    <EventsClientLayout isEventsHost={isEventsHost}>
      {children}
    </EventsClientLayout>
  );
}
