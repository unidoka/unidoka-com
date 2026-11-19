"use client";

const CELLS = Array.from({ length: 42 }, (_, i) => i);

function Shimmer({ className }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-md ${className ?? ""}`} />;
}

export function EventsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading events</span>

      <aside className="hidden lg:flex flex-col gap-4">
        <div className="rounded-2xl border border-(--outline) bg-(--card) p-4">
          <div className="flex items-center justify-between">
            <Shimmer className="h-3 w-20" />
            <Shimmer className="h-3 w-12" />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Shimmer key={i} className="h-7 w-[30%] rounded-full" />
            ))}
          </div>
          <Shimmer className="mt-5 h-11 w-full rounded-xl" />
        </div>

        <div className="rounded-xl border border-(--outline) bg-(--card) p-3">
          <div className="flex items-center justify-between px-1">
            <Shimmer className="size-7 rounded-lg" />
            <Shimmer className="h-3 w-24" />
            <Shimmer className="size-7 rounded-lg" />
          </div>
          <div className="mt-4 grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <Shimmer key={`w-${i}`} className="mx-auto size-3 rounded-full" />
            ))}
            {Array.from({ length: 35 }).map((_, i) => (
              <Shimmer key={`d-${i}`} className="mx-auto size-5 rounded-full" />
            ))}
          </div>
        </div>
      </aside>

      <div className="overflow-hidden rounded-2xl border border-(--outline) bg-(--card)">
        <div className="grid grid-cols-7 border-b border-(--outline)">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex h-9 items-center justify-center sm:h-10">
              <Shimmer className="h-2.5 w-8" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {CELLS.map((i) => (
            <div
              key={i}
              className={`min-h-[88px] border-(--outline) p-2 sm:min-h-[104px] ${
                i % 7 !== 6 ? "border-r" : ""
              } ${i < 35 ? "border-b" : ""}`}
            >
              <Shimmer className="size-5 rounded-full" />
              {i % 3 !== 1 && (
                <div className="mt-2 flex flex-col gap-1">
                  <Shimmer className="h-4 w-full rounded-md" />
                  {i % 5 === 0 && <Shimmer className="h-4 w-4/5 rounded-md" />}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
