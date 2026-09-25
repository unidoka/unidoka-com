"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";

const TABS = [
  { path: "/", label: "События" },
  { path: "/vershiny", label: "Вершины" },
];

function normalize(p: string): string {
  const stripped = p.replace(/^\/events(?=\/|$)/, "");
  return stripped === "" ? "/" : stripped;
}

export default function EventsClientLayout({
  children,
  isEventsHost,
}: {
  children: React.ReactNode;
  isEventsHost: boolean;
}) {
  const pathname = usePathname();
  const prefix = isEventsHost ? "" : "/events";
  const current = normalize(pathname);

  return (
    <>
      <div className="border-b border-(--outline) bg-(--bg) mt-[72px] sm:mt-[100px]">
        {/* <Container>
          <nav className="flex items-center gap-1 py-3 overflow-x-auto">
            {TABS.map((t) => {
              const href = `${prefix}${t.path}` || "/";
              const active =
                t.path === "/"
                  ? current === "/"
                  : current.startsWith(t.path);
              return (
                <Link
                  key={t.path}
                  href={href}
                  className={cn(
                    "px-4 py-2 rounded-full text-body-4 font-medium transition-colors whitespace-nowrap",
                    active
                      ? "bg-(--primary-glass) text-(--primary)"
                      : "text-(--on-bg-medium) hover:bg-(--state-hover)"
                  )}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </Container> */}
      </div>
      {children}
    </>
  );
}
