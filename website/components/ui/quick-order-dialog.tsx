"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInputField } from "@/components/ui/phone-input";
import { toast } from "sonner";
import { CircleNotchIcon } from "@phosphor-icons/react";

export function QuickOrderDialog({
  serviceName: _serviceName,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  serviceName?: string;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (val: boolean) => {
    if (!isControlled) setUncontrolledOpen(val);
    controlledOnOpenChange?.(val);
  };

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<string | undefined>();
  const [desc, setDesc] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      toast.error("Пожалуйста, заполните имя, email и телефон");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/v1/consult`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            phone,
            description: desc || undefined,
          }),
        },
      );
      if (res.ok) {
        toast.success("Заявка принята! Мы свяжемся с вами в ближайшее время.");
        setOpen(false);
        setName("");
        setEmail("");
        setPhone("");
        setDesc("");
      } else {
        const data = await res.json().catch(() => ({}));
        const detail = Array.isArray(data.detail)
          ? data.detail[0]?.msg
          : data.detail;
        toast.error(detail || "Ошибка при отправке");
      }
    } catch {
      toast.error("Сетевая ошибка. Проверьте подключение.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent
        className="sm:max-w-[440px] p-0 overflow-hidden border-(--outline) bg-(--bg) gap-0 z-[10000]"
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("[data-floating-dropdown]")) {
            e.preventDefault();
          }
        }}
      >
        <div className="p-6 md:p-8 space-y-6 max-h-[85vh] overflow-y-auto scrollbar-admin">
          <div>
            <h2 className="text-2xl font-heading tracking-tight text-(--on-bg-high)">
              Обсудить проект
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-(--on-bg-high)">Ваше имя *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Иван"
                className="bg-(--card) border-(--outline) h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-(--on-bg-high)">Email *</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="bg-(--card) border-(--outline) h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-(--on-bg-high)">Телефон *</Label>
              <PhoneInputField
                value={phone ?? ""}
                onChange={setPhone}
                className="bg-(--card) border-(--outline) h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-(--on-bg-high)">Комментарий</Label>
              <Textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Кратко о задаче..."
                className="min-h-[80px] bg-(--card) border-(--outline)"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-medium mt-2"
            >
              {loading ? (
                <CircleNotchIcon className="size-5 animate-spin mr-2" />
              ) : null}
              {loading ? "Отправка..." : "Отправить заявку"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
