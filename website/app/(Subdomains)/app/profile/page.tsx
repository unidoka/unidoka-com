"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { ImageUploadField } from "@/components/editor/image-upload-field";
import {
  CircleNotchIcon,
  GithubLogo,
  TelegramLogo,
} from "@phosphor-icons/react";
import { updateProfile } from "@/utils/api/user";

interface FormState {
  name: string;
  surname: string;
  username: string;
  phone: string;
  description: string;
  avatar_url: string;
  telegram_username: string;
  github_url: string;
}

const GITHUB_PREFIX = "https://github.com/";

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const [form, setForm] = useState<FormState>({
    name: "", surname: "", username: "", phone: "",
    description: "", avatar_url: "", telegram_username: "", github_url: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Sync form → user on mount and whenever context refreshes.
  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name ?? "",
      surname: user.surname ?? "",
      username: user.username ?? "",
      phone: user.phone ?? "",
      description: user.description ?? "",
      avatar_url: user.avatar_url ?? "",
      telegram_username: user.telegram_username ?? "",
      github_url: user.github_url ?? "",
    });
  }, [user]);

  if (!user) return null;

  const set = (k: keyof FormState, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (form.username && !/^[a-z0-9_-]+$/.test(form.username.toLowerCase()))
      next.username = "Только латиница, цифры, _ и -";
    if (form.telegram_username) {
      const h = form.telegram_username.replace(/^@/, "");
      if (!/^[a-zA-Z0-9_]{5,32}$/.test(h))
        next.telegram_username = "5–32 символа: латиница, цифры, _";
    }
    if (form.github_url && !form.github_url.startsWith(GITHUB_PREFIX))
      next.github_url = `Ссылка должна начинаться с ${GITHUB_PREFIX}`;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const updated = await updateProfile({
        name: form.name.trim() || undefined,
        surname: form.surname.trim() || undefined,
        username: form.username.trim().toLowerCase() || undefined,
        phone: form.phone.trim() || undefined,
        description: form.description.trim() || undefined,
        avatar_url: form.avatar_url || undefined,
        telegram_username: form.telegram_username.replace(/^@/, "").trim() || undefined,
        github_url: form.github_url.trim() || undefined,
      });
      // Sync global context so the header avatar + name update without
      // a page reload.
      setUser({ ...user, ...updated });
      toast.success("Профиль сохранён");
    } catch (err: any) {
      toast.error(err?.message || "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  };

  // Avatar is persisted immediately on upload. Without this, the user
  // had to remember to hit "Сохранить изменения" — otherwise the preview
  // showed the new image (local state) but the next GET /me returned the
  // old value (or null), and the avatar reverted to initials on reload.
  const onAvatarChange = async (url: string) => {
    set("avatar_url", url);
    if (!user) return;
    try {
      const updated = await updateProfile({
        avatar_url: url || undefined,
      });
      setUser({ ...user, ...updated });
    } catch (err: any) {
      toast.error(err?.message || "Не удалось сохранить аватар");
    }
  };

  const reset = () => {
    if (!user) return;
    setForm({
      name: user.name ?? "",
      surname: user.surname ?? "",
      username: user.username ?? "",
      phone: user.phone ?? "",
      description: user.description ?? "",
      avatar_url: user.avatar_url ?? "",
      telegram_username: user.telegram_username ?? "",
      github_url: user.github_url ?? "",
    });
    setErrors({});
  };

  const initials =
    [form.name, form.surname].filter(Boolean).join(" ").trim() ||
    form.username ||
    user.email?.split("@")[0] ||
    "?";

  return (
    <CheckUser>
      <div className="space-y-6">
        <div>
          <h1 className="text-display-2 mb-1">Профиль</h1>
          <p className="text-body-3 text-(--on-bg-medium)">
            Управление публичной информацией аккаунта
          </p>
        </div>

        {/* Avatar + identity */}
        <Card className="rounded-3xl border-(--outline) p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-6 md:gap-8 items-start">
            <ImageUploadField
              value={form.avatar_url}
              onChange={onAvatarChange}
              variant="avatar"
              aspect={1}
              outputSize={512}
              fallbackText={initials}
            />
            <div className="flex-1 min-w-0 space-y-2">
              <h2 className="text-heading-2 truncate">
                {form.name || form.username || "Без имени"}
              </h2>
              <p className="text-body-4 text-(--on-bg-low) truncate">
                {user.email}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Badge variant="tonal-card-static" size="chip-small">
                  {user.role}
                </Badge>
                {user.verified && (
                  <Badge
                    variant="tonal-card-static"
                    size="chip-small"
                    className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                  >
                    Подтверждён
                  </Badge>
                )}
              </div>
              <p className="text-body-5 text-(--on-bg-low) pt-2 leading-relaxed">
                Квадратное изображение 1:1. Перетаскивайте и масштабируйте
                при загрузке.
              </p>
            </div>
          </div>
        </Card>

        {/* Personal info */}
        <Card className="rounded-3xl border-(--outline) p-6 md:p-8 space-y-5">
          <h2 className="text-heading-3">Личная информация</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field data-invalid={!!errors.name}>
              <FieldLabel>Имя</FieldLabel>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                autoComplete="given-name"
              />
              {errors.name && <FieldError errors={[{ message: errors.name }]} />}
            </Field>
            <Field data-invalid={!!errors.surname}>
              <FieldLabel>Фамилия</FieldLabel>
              <Input
                value={form.surname}
                onChange={(e) => set("surname", e.target.value)}
                autoComplete="family-name"
              />
              {errors.surname && <FieldError errors={[{ message: errors.surname }]} />}
            </Field>
            <Field data-invalid={!!errors.username}>
              <FieldLabel>Username</FieldLabel>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-body-4 text-(--on-bg-low) pointer-events-none select-none">
                  @
                </span>
                <Input
                  value={form.username}
                  onChange={(e) =>
                    set("username", e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
                  }
                  className="pl-7"
                  placeholder="niyazgim"
                />
              </div>
              {errors.username && <FieldError errors={[{ message: errors.username }]} />}
            </Field>
            <Field data-invalid={!!errors.phone}>
              <FieldLabel>Телефон</FieldLabel>
              <Input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                autoComplete="tel"
                placeholder="+7 999 000-00-00"
              />
              {errors.phone && <FieldError errors={[{ message: errors.phone }]} />}
            </Field>
            <Field className="md:col-span-2" data-invalid={!!errors.description}>
              <FieldLabel>О себе</FieldLabel>
              <Textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Коротко о том, чем занимаетесь"
                className="min-h-[110px]"
              />
              {errors.description && <FieldError errors={[{ message: errors.description }]} />}
            </Field>
          </div>
        </Card>

        {/* Public links */}
        <Card className="rounded-3xl border-(--outline) p-6 md:p-8 space-y-5">
          <div>
            <h2 className="text-heading-3 mb-1">Публичные ссылки</h2>
            <p className="text-body-4 text-(--on-bg-medium)">
              Отображаются в вашем публичном профиле.
            </p>
          </div>

          <Field data-invalid={!!errors.telegram_username}>
            <FieldLabel>
              <TelegramLogo className="size-4" />
              Telegram
            </FieldLabel>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-body-4 text-(--on-bg-low) pointer-events-none select-none">
                @
              </span>
              <Input
                value={form.telegram_username}
                onChange={(e) => set("telegram_username", e.target.value.replace(/^@/, ""))}
                className="pl-7"
                placeholder="username"
                autoComplete="off"
              />
            </div>
            {errors.telegram_username && (
              <FieldError errors={[{ message: errors.telegram_username }]} />
            )}
          </Field>

          <Field data-invalid={!!errors.github_url}>
            <FieldLabel>
              <GithubLogo className="size-4" />
              GitHub
            </FieldLabel>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-body-4 text-(--on-bg-low) pointer-events-none select-none">
                github.com/
              </span>
              <Input
                value={form.github_url.replace(/^https?:\/\/github\.com\//, "")}
                onChange={(e) => {
                  const h = e.target.value.replace(/^https?:\/\/github\.com\//, "");
                  set("github_url", h ? GITHUB_PREFIX + h : "");
                }}
                className="pl-[92px]"
                placeholder="username"
                autoComplete="off"
              />
            </div>
            {errors.github_url && (
              <FieldError errors={[{ message: errors.github_url }]} />
            )}
          </Field>
        </Card>

        {/* Save bar */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={save} disabled={saving} size="large">
            {saving && <CircleNotchIcon className="size-4 animate-spin" />}
            {saving ? "Сохранение…" : "Сохранить изменения"}
          </Button>
          <Button variant="outlined" size="large" onClick={reset} disabled={saving}>
            Сбросить
          </Button>
        </div>
      </div>
    </CheckUser>
  );
}
