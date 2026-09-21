"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { toast } from "sonner";

interface Props {
  children: React.ReactNode;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RequestDemoDialog({ children }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  const reset = () => {
    setName("");
    setEmail("");
    setCompany("");
    setErrors({});
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Укажите имя";
    if (!EMAIL_RE.test(email)) next.email = "Некорректный email";
    setErrors(next);
    if (Object.keys(next).length) return;

    setPending(true);
    // TODO: wire to real endpoint — placeholder for now.
    await new Promise((r) => setTimeout(r, 600));
    setPending(false);
    toast.success("Заявка отправлена. Мы свяжемся с вами.");
    setOpen(false);
    reset();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Запросить демо</DialogTitle>
            <DialogDescription>
              Оставьте контакты — покажем 0leak на ваших данных.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <Field>
              <FieldLabel>Имя</FieldLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!errors.name}
                placeholder="Как к вам обращаться"
              />
              <FieldError errors={errors.name ? [{ message: errors.name }] : []} />
            </Field>

            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
                placeholder="you@company.com"
              />
              <FieldError errors={errors.email ? [{ message: errors.email }] : []} />
            </Field>

            <Field>
              <FieldLabel>Компания</FieldLabel>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Необязательно"
              />
            </Field>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="text" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Отправка..." : "Отправить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
