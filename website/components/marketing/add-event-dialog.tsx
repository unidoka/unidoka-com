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
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { toast } from "sonner";

interface Props {
  children: React.ReactNode;
}

interface FormState {
  name: string;
  email: string;
  messenger: string;
  eventName: string;
  eventDescription: string;
  eventUrl: string;
}

const EMPTY: FormState = {
  name: "",
  email: "",
  messenger: "",
  eventName: "",
  eventDescription: "",
  eventUrl: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Loose check: must look like an http(s) URL if provided.
const URL_RE = /^https?:\/\/.+\..+/i;

export function AddEventDialog({ children }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [pending, setPending] = useState(false);

  const update =
    <K extends keyof FormState>(key: K) =>
    (value: FormState[K]) =>
      setForm((f) => ({ ...f, [key]: value }));

  const reset = () => {
    setForm(EMPTY);
    setErrors({});
  };

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Укажите имя";
    if (!EMAIL_RE.test(form.email)) next.email = "Некорректный email";
    if (!form.messenger.trim()) next.messenger = "Укажите контакт для связи";
    if (!form.eventName.trim()) next.eventName = "Укажите название события";
    if (form.eventDescription.trim().length < 20)
      next.eventDescription = "Опишите событие подробнее (минимум 20 символов)";
    if (form.eventUrl && !URL_RE.test(form.eventUrl))
      next.eventUrl = "Ссылка должна начинаться с http:// или https://";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setPending(true);
    // TODO: POST to real endpoint. Placeholder for now.
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
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Добавить событие</DialogTitle>
            <DialogDescription>
              Расскажите о своём событии — мы рассмотрим и добавим в календарь.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Ваше имя</FieldLabel>
                <Input
                  value={form.name}
                  onChange={(e) => update("name")(e.target.value)}
                  aria-invalid={!!errors.name}
                  placeholder="Иван Петров"
                />
                <FieldError errors={errors.name ? [{ message: errors.name }] : []} />
              </Field>

              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email")(e.target.value)}
                  aria-invalid={!!errors.email}
                  placeholder="you@example.com"
                />
                <FieldError errors={errors.email ? [{ message: errors.email }] : []} />
              </Field>
            </div>

            <Field>
              <FieldLabel>Мессенджер для связи</FieldLabel>
              <Input
                value={form.messenger}
                onChange={(e) => update("messenger")(e.target.value)}
                aria-invalid={!!errors.messenger}
                placeholder="@telegram или +7..."
              />
              <FieldError
                errors={errors.messenger ? [{ message: errors.messenger }] : []}
              />
            </Field>

            <Field>
              <FieldLabel>Название события</FieldLabel>
              <Input
                value={form.eventName}
                onChange={(e) => update("eventName")(e.target.value)}
                aria-invalid={!!errors.eventName}
                placeholder="Хакатон 2026"
              />
              <FieldError
                errors={errors.eventName ? [{ message: errors.eventName }] : []}
              />
            </Field>

            <Field>
              <FieldLabel>Описание события</FieldLabel>
              <Textarea
                value={form.eventDescription}
                onChange={(e) => update("eventDescription")(e.target.value)}
                aria-invalid={!!errors.eventDescription}
                placeholder="Что это за событие, для кого, что будет происходить..."
                rows={4}
              />
              <FieldError
                errors={
                  errors.eventDescription
                    ? [{ message: errors.eventDescription }]
                    : []
                }
              />
            </Field>

            <Field>
              <FieldLabel>Ссылка на сайт события</FieldLabel>
              <Input
                type="url"
                value={form.eventUrl}
                onChange={(e) => update("eventUrl")(e.target.value)}
                aria-invalid={!!errors.eventUrl}
                placeholder="https://example.com/event"
              />
              <FieldError errors={errors.eventUrl ? [{ message: errors.eventUrl }] : []} />
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
