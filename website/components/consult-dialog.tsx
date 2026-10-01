"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConsultForm } from "./consult-form";
export function ConsultDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto scrollbar-admin">
        <DialogHeader>
          <DialogTitle>Оставить заявку</DialogTitle>
          <DialogDescription>
            Оставьте контакты — свяжемся в течение рабочего дня.
          </DialogDescription>
        </DialogHeader>
        <ConsultForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
