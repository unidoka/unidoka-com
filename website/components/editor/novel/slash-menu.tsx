import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { cn } from "@/lib/utils";

interface SlashMenuProps {
  items: any[];
  command: (item: any) => void;
}

export const SlashMenu = forwardRef<any, SlashMenuProps>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = items[index];
    if (item) {
      command(item);
    }
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((selectedIndex + items.length - 1) % items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((selectedIndex + 1) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div className="z-50 max-h-[min(70vh,26rem)] w-72 overflow-y-auto overscroll-contain rounded-xl border border-(--outline) bg-(--card) p-1 shadow-xl">
      {items.map((item, index) => {
        const selected = index === selectedIndex;
        return (
          <button
            key={item.title}
            type="button"
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
            className={cn(
              "flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
              selected
                ? "bg-(--primary) text-(--on-primary)"
                : "text-(--on-bg-medium) hover:bg-(--state-hover)",
            )}
          >
            <span
              className={cn(
                "mt-0.5 shrink-0",
                selected ? "text-(--on-primary)" : "text-(--on-bg-low)",
              )}
            >
              {item.icon}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{item.title}</span>
              <span className={cn("block truncate text-xs", selected ? "opacity-70" : "text-(--on-bg-low)")}>
                {item.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
});

SlashMenu.displayName = "SlashMenu";
