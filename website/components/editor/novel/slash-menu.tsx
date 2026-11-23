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
    <div className="z-50 w-64 rounded-xl border border-(--outline) bg-(--card) p-1 shadow-xl">
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => selectItem(index)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
            index === selectedIndex ? "bg-(--primary) text-(--on-primary)" : "text-(--on-bg-medium) hover:bg-(--state-hover)"
          )}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-(--bg) border border-(--outline)">
            {item.icon}
          </div>
          <div>
            <div className="font-medium">{item.title}</div>
            <div className="text-xs opacity-70">{item.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
});

SlashMenu.displayName = "SlashMenu";
