import { headers } from "next/headers";
import { redirect } from "next/navigation";

// The landing content now lives on the events subdomain at /vershiny.
// Any hit on the root domain's "/" is redirected there so old links keep working.
export default async function RootPage() {
  const h = await headers();
  const rawHost = h.get("host") ?? "localhost:3000";
  const [bareHost, port] = rawHost.split(":");
  const rootHost = bareHost.replace(/^events\./, "");
  const eventsHost = `events.${rootHost}${port ? `:${port}` : ""}`;
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  redirect(`${protocol}://${eventsHost}/vershiny`);
}
