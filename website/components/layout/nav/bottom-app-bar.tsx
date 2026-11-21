"use client";
import { QuickOrderDialog } from "@/components/ui/quick-order-dialog";
import { FloatingMenu } from "./floating-menu";
import { CycleText } from "./cycle-text";
import { TelemostStackIcon } from "@/components/icons/telemost-stack-icon";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";
import { ORDER_CYCLE_KEYS } from "@/entities/i18n/header";

export default function BottomAppBar() {
  const { t } = useLanguage();

  return (
    <nav
      aria-label="Bottom app bar"
      className="sm:hidden fixed bottom-4 inset-x-4 z-[100] flex gap-2 items-center justify-between pointer-events-none pb-safe"
    >
      {/* CTA / Ordering Button */}
      <div className="flex-1 pointer-events-auto">
        <QuickOrderDialog>
          <Button
            size="small"
            shape="square"
            variant="tonal-card"
            className="w-full h-14! justify-center gap-2 rounded-2xl border-none bg-card shadow-[0_8px_24px_-6px_rgba(0,0,0,0.12),0_2px_8px_-2px_rgba(0,0,0,0.04)]"
          >
            <TelemostStackIcon className="-ml-1" />
            <CycleText labels={ORDER_CYCLE_KEYS.map((key) => t(key))} />
          </Button>
        </QuickOrderDialog>
      </div>

      {/* Burger Menu Button */}
      <div className="rounded-2xl bg-card shadow-[0_8px_24px_-6px_rgba(0,0,0,0.12),0_2px_8px_-2px_rgba(0,0,0,0.04)] pointer-events-auto shrink-0">
        <FloatingMenu
          position="bottom"
          triggerSize="icon-small"
          triggerShape="square"
          triggerClassName="size-14! p-0! flex items-center justify-center rounded-2xl hover:bg-(--state-hover) transition-colors border-none bg-transparent!"
          triggerIconClassName="size-6!"
        />
      </div>
    </nav>
  );
}
