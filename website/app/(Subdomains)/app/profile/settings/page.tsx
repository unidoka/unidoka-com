"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckUser } from "@/entities/user/model/check-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Bell,
  CalendarBlank,
  EnvelopeSimple,
  Info,
  TelegramLogo,
  Trophy,
  CircleNotchIcon,
  CheckCircleIcon,
  ArrowSquareOutIcon,
  ArrowClockwiseIcon,
  LinkBreakIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  fetchNotificationPrefs,
  updateNotificationPrefs,
  createTelegramLinkCode,
  disconnectTelegram,
  type NotificationPrefs,
  type TelegramConnectCode,
} from "@/utils/api/notifications";

/**
 * User-subscribable topics. Order notifications are NOT listed here —
 * recipients are picked by root via the admin panel. Legal / policy /
 * account mail is transactional and not toggleable.
 */
const TOPICS: { id: string; label: string; hint: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    id: "events",
    label: "События",
    hint: "Форумы, хакатоны, митапы",
    icon: CalendarBlank,
  },
  {
    id: "vershiny",
    label: "Вершины",
    hint: "Обновления программы",
    icon: Trophy,
  },
];

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState<
    "email" | "telegram" | "topics" | null
  >(null);
  const [linkCode, setLinkCode] = useState<TelegramConnectCode | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setPrefs(await fetchNotificationPrefs());
    } catch (err: any) {
      toast.error(err?.message || "Не удалось загрузить настройки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ── Channel toggles ─────────────────────────────────────────── */

  const toggleEmail = async (v: boolean) => {
    if (!prefs) return;
    const prev = prefs;
    setPrefs({ ...prefs, email_enabled: v });
    setSavingField("email");
    try {
      setPrefs(await updateNotificationPrefs({ email_enabled: v }));
    } catch (err: any) {
      setPrefs(prev);
      toast.error(err?.message || "Ошибка сохранения");
    } finally {
      setSavingField(null);
    }
  };

  const toggleTelegram = async (v: boolean) => {
    if (!prefs) return;
    const prev = prefs;
    setPrefs({ ...prefs, telegram_enabled: v });
    setSavingField("telegram");
    try {
      setPrefs(await updateNotificationPrefs({ telegram_enabled: v }));
    } catch (err: any) {
      setPrefs(prev);
      toast.error(err?.message || "Ошибка сохранения");
    } finally {
      setSavingField(null);
    }
  };

  /* ── Topic subscriptions ─────────────────────────────────────── */

  const toggleTopic = async (id: string) => {
    if (!prefs) return;
    const prev = prefs;
    const has = prefs.topics.includes(id);
    const next = has
      ? prefs.topics.filter((t) => t !== id)
      : [...prefs.topics, id];
    setPrefs({ ...prefs, topics: next });
    setSavingField("topics");
    try {
      setPrefs(await updateNotificationPrefs({ topics: next }));
    } catch (err: any) {
      setPrefs(prev);
      toast.error(err?.message || "Ошибка сохранения");
    } finally {
      setSavingField(null);
    }
  };

  /* ── Telegram linking (backend not implemented) ──────────────── */

  const handleConnectTelegram = async () => {
    try {
      const code = await createTelegramLinkCode();
      setLinkCode(code);
      setLinkDialogOpen(true);
      window.open(code.url, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      toast.error(err?.message || "Не удалось создать код подключения");
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Отключить Telegram? Уведомления в Telegram перестанут приходить.")) return;
    try {
      await disconnectTelegram();
      toast.success("Telegram отключён");
      await load();
    } catch (err: any) {
      toast.error(err?.message || "Ошибка отключения");
    }
  };

  const handleRefreshStatus = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
    toast.info("Статус обновлён", { duration: 1500 });
  };

  const handleRegenerateCode = async () => {
    try {
      setLinkCode(await createTelegramLinkCode());
    } catch (err: any) {
      toast.error(err?.message || "Не удалось создать код");
    }
  };

  return (
    <CheckUser>
      <div className="space-y-6">
        <div>
          <h1 className="text-display-2 mb-1">Настройки</h1>
          <p className="text-body-3 text-(--on-bg-medium)">
            Управление аккаунтом и уведомлениями
          </p>
        </div>

        <Card className="rounded-3xl border-(--outline) p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-(--primary-card) text-(--primary)">
              <Bell className="size-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-heading-3">Уведомления</h2>
              <p className="text-body-4 text-(--on-bg-medium) mt-1 leading-relaxed">
                Выберите, куда и о чём присылать письма. Системные
                сообщения о политике, безопасности и аккаунте приходят
                всегда — их отключить нельзя.
              </p>
            </div>
          </div>

          {loading || !prefs ? (
            <div className="flex items-center gap-2 py-4 text-body-4 text-(--on-bg-low)">
              <CircleNotchIcon className="size-4 animate-spin" /> Загрузка…
            </div>
          ) : (
            <>
              {/* ── Channel toggles ─────────────────────────────── */}
              <div className="space-y-1">
                <ChannelRow
                  icon={<EnvelopeSimple className="size-5" />}
                  label="Email-уведомления"
                  hint="Письма о выбранных темах и активности"
                  checked={prefs.email_enabled}
                  onCheckedChange={toggleEmail}
                  disabled={savingField === "email"}
                />

                <ChannelRow
                  icon={<TelegramLogo className="size-5" />}
                  label="Telegram-уведомления"
                  hint="Сообщения от бота"
                  checked={prefs.telegram_enabled}
                  onCheckedChange={toggleTelegram}
                  disabled={savingField === "telegram"}
                />

                {/* Telegram connect state */}
                {prefs.telegram_connected ? (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircleIcon
                        className="size-4 shrink-0 text-emerald-500"
                        weight="fill"
                      />
                      <span className="text-body-4 truncate">
                        Подключено
                        {prefs.telegram_username && (
                          <>
                            {" · "}
                            <b>@{prefs.telegram_username}</b>
                          </>
                        )}
                      </span>
                    </div>
                    <Button
                      variant="text"
                      size="small"
                      onClick={handleDisconnect}
                      className="shrink-0"
                    >
                      <LinkBreakIcon className="size-4" /> Отключить
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-(--outline) bg-(--bg) p-3 flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-body-4">Telegram не подключён</p>
                      <p className="text-body-5 text-(--on-bg-low)">
                        {prefs.bot_username
                          ? "Подключите бота, чтобы получать сообщения"
                          : "Бот не настроен на сервере"}
                      </p>
                    </div>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleConnectTelegram}
                      disabled={!prefs.bot_username}
                      className="shrink-0"
                    >
                      <TelegramLogo className="size-4" /> Подключить
                    </Button>
                  </div>
                )}
              </div>

              <div className="border-t border-(--outline)" />

              {/* ── Topic subscriptions ─────────────────────────── */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-heading-5">Что присылать</h3>
                  <p className="text-body-5 text-(--on-bg-low) mt-0.5">
                    Отметьте интересующие темы
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TOPICS.map(({ id, label, hint, icon: Icon }) => {
                    const active = prefs.topics.includes(id);
                    const anyChannel = prefs.email_enabled || prefs.telegram_enabled;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleTopic(id)}
                        disabled={!anyChannel || savingField === "topics"}
                        className={cn(
                          "flex items-start gap-3 rounded-2xl border p-3 text-left transition-all",
                          "disabled:cursor-not-allowed disabled:opacity-50",
                          active
                            ? "border-(--primary) bg-(--primary-glass)"
                            : "border-(--outline) bg-transparent hover:border-(--primary)/40",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-xl",
                            active
                              ? "bg-(--primary) text-(--on-primary)"
                              : "bg-(--state-hover) text-(--on-bg-medium)",
                          )}
                        >
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block text-body-4 font-medium",
                              active ? "text-(--primary)" : "text-(--on-bg-high)",
                            )}
                          >
                            {label}
                          </span>
                          <span className="block text-body-5 text-(--on-bg-low) leading-snug mt-0.5">
                            {hint}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                {!prefs.email_enabled && !prefs.telegram_enabled && (
                  <p className="text-body-5 text-(--on-bg-low)">
                    Включите хотя бы один канал, чтобы выбрать темы.
                  </p>
                )}
              </div>

              {/* ── Order-notification note ─────────────────────── */}
              <div className="flex items-start gap-3 rounded-2xl border border-(--outline) bg-(--bg) p-3">
                <Info className="size-4 shrink-0 text-(--on-bg-low) mt-0.5" />
                <p className="text-body-5 text-(--on-bg-medium) leading-relaxed">
                  Уведомления о новых заявках на услуги настраиваются
                  администратором. Обратитесь в поддержку, если вам
                  нужно получать такие письма.
                </p>
              </div>
            </>
          )}
        </Card>

        <Card className="rounded-3xl border-(--outline) p-6 md:p-8">
          <h2 className="text-heading-3 mb-2">Аккаунт</h2>
          <p className="text-body-3 text-(--on-bg-medium)">
            Управление профилем, паролем и безопасностью — в
            соответствующих разделах бокового меню.
          </p>
        </Card>
      </div>

      {/* ── Telegram link dialog (unchanged) ────────────────────── */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TelegramLogo className="size-5 text-(--primary)" /> Подключение Telegram
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <ol className="text-body-3 text-(--on-bg-medium) space-y-3 list-decimal pl-5">
              <li>
                Открылся Telegram — нажмите <b>Start</b> в диалоге с ботом.
              </li>
              <li>
                Вернитесь на эту страницу и нажмите{" "}
                <b>«Проверить подключение»</b>.
              </li>
            </ol>
            {linkCode && (
              <div className="rounded-2xl border border-(--outline) bg-(--bg) p-3 space-y-2">
                <p className="text-body-5 uppercase tracking-wider text-(--on-bg-low)">
                  Если Telegram не открылся автоматически
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="font-mono text-body-4 bg-(--card) border border-(--outline) rounded-lg px-2 py-1">
                    {linkCode.code}
                  </code>
                  <Button variant="outlined" size="small" asChild>
                    <a href={linkCode.url} target="_blank" rel="noopener noreferrer">
                      <ArrowSquareOutIcon className="size-4" /> Открыть Telegram
                    </a>
                  </Button>
                </div>
                <p className="text-body-6 text-(--on-bg-low)">
                  Код действует {Math.round(linkCode.expires_in / 60)} мин.
                </p>
              </div>
            )}
            <Button
              variant="text"
              size="small"
              onClick={handleRegenerateCode}
              className="text-(--on-bg-low)"
            >
              <ArrowClockwiseIcon className="size-4" /> Создать новый код
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outlined" onClick={() => setLinkDialogOpen(false)}>
              Закрыть
            </Button>
            <Button onClick={handleRefreshStatus} disabled={refreshing}>
              {refreshing ? (
                <CircleNotchIcon className="size-4 animate-spin" />
              ) : (
                <CheckCircleIcon className="size-4" />
              )}
              Проверить подключение
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CheckUser>
  );
}

/* ── Row component ─────────────────────────────────────────────── */

function ChannelRow({
  icon,
  label,
  hint,
  checked,
  onCheckedChange,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-(--outline) last:border-b-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex size-10 items-center justify-center rounded-xl bg-(--primary-card) text-(--primary) shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <Label className="text-body-3 font-medium cursor-pointer">
            {label}
          </Label>
          <p className="text-body-5 text-(--on-bg-low)">{hint}</p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}
