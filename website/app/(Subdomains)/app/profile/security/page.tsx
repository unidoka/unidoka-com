"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { changePassword, deleteAccount } from "@/utils/api/user";
import { $fetch } from "@/utils/fetch";
import Image from "next/image";
import { Laptop, ShieldCheck } from "@phosphor-icons/react";
import { Field, FieldLabel } from "@/components/ui/field";

export default function SecurityPage() {
  const { user, isLoading, logout } = useUser();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 2FA State
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);

  const loadSessions = async () => {
    const res = await $fetch("/api/v1/me/sessions", { isToast: false });
    if (res?.json) setSessions(res.json);
  };

  useEffect(() => {
    if (user) loadSessions();
  }, [user]);

  const handleSetup2FA = async () => {
    setIs2FALoading(true);
    const res = await $fetch("/api/v1/me/2fa/setup", { method: "POST" });
    if (res?.json?.qr_base64) {
      setQrCode(res.json.qr_base64);
    }
    setIs2FALoading(false);
  };

  const handleEnable2FA = async () => {
    setIs2FALoading(true);
    const res = await $fetch("/api/v1/me/2fa/enable", {
      method: "POST",
      body: JSON.stringify({ code: totpCode }),
      headers: { "Content-Type": "application/json" },
    });
    if (res?.response?.ok) {
      toast.success("2FA включена");
      setQrCode(null);
      window.location.reload();
    } else {
      toast.error("Неверный код");
    }
    setIs2FALoading(false);
  };

  const handleDisable2FA = async () => {
    if (!confirm("Отключить 2FA? Это снизит безопасность аккаунта.")) return;
    setIs2FALoading(true);
    await $fetch("/api/v1/me/2fa/disable", { method: "POST" });
    window.location.reload();
  };

  const handleRevokeSession = async (id: string) => {
    await $fetch(`/api/v1/me/sessions/${id}`, { method: "DELETE" });
    setSessions(sessions.filter(s => s.id !== id));
    toast.success("Сессия завершена");
  };

  if (isLoading || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error("Пароли не совпадают"); return; }
    if (newPassword.length < 8) { toast.error("Новый пароль должен быть не короче 8 символов"); return; }
    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Пароль успешно изменён");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch { toast.error("Ошибка при смене пароля"); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      toast.success("Аккаунт удалён");
      try { await logout(); } catch { }
      router.push("/");
    } catch {
      toast.error("Не удалось удалить аккаунт");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div>
        <h1 className="text-display-2 mb-1">Безопасность</h1>
        <p className="text-body-2 text-(--on-bg-medium)">Управление безопасностью аккаунта</p>
      </div>

      <Card className="rounded-3xl border-(--outline) p-6 shadow-sm">
        <h2 className="text-heading-3 mb-4">Смена пароля</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Field><FieldLabel>Текущий пароль</FieldLabel>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required /></Field>
          <Field><FieldLabel>Новый пароль</FieldLabel>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /></Field>
          <Field><FieldLabel>Подтвердите новый пароль</FieldLabel>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></Field>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Сохранение..." : "Изменить пароль"}</Button>
        </form>
      </Card>

      <Card className="rounded-3xl border-(--outline) p-6 shadow-sm">
        <h2 className="text-heading-3 mb-2">Активные сессии</h2>
        <p className="text-body-3 text-(--on-bg-medium)">Здесь будет отображаться информация о текущих сессиях (в разработке).</p>
      </Card>

      {/* ── 2FA Section ─────────────────────────────────────── */}
      <Card className="rounded-3xl border-(--outline) p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-heading-3 flex items-center gap-2">
              <ShieldCheck className="size-5" /> Двухфакторная аутентификация
            </h2>
            <p className="text-body-3 text-(--on-bg-medium) mt-1">
              Защитите аккаунт с помощью приложения (Google Authenticator, Яндекс Ключ).
            </p>
          </div>
        </div>
        
        {user.two_factor_enabled ? (
          <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
            <span className="text-body-3 font-medium text-emerald-600 dark:text-emerald-400">2FA включена</span>
            <Button variant="outlined" size="small" onClick={handleDisable2FA} disabled={is2FALoading}>Отключить</Button>
          </div>
        ) : qrCode ? (
          <div className="space-y-4">
            <p className="text-body-3">Отсканируйте QR-код в приложении:</p>
            <div className="bg-white p-4 rounded-xl w-fit mx-auto">
              <img src={`data:image/png;base64,${qrCode}`} alt="2FA QR" className="size-48" />
            </div>
            <div className="max-w-xs mx-auto space-y-2">
              <Field>
                <FieldLabel>Введите 6-значный код для подтверждения</FieldLabel>
                <Input value={totpCode} onChange={(e) => setTotpCode(e.target.value)} maxLength={6} className="text-center font-mono text-lg" />
              </Field>
              <Button className="w-full" onClick={handleEnable2FA} disabled={is2FALoading || totpCode.length < 6}>Включить</Button>
            </div>
          </div>
        ) : (
          <Button onClick={handleSetup2FA} disabled={is2FALoading}>
            {is2FALoading ? "Загрузка..." : "Настроить 2FA"}
          </Button>
        )}
      </Card>

      {/* ── Active Sessions ─────────────────────────────────── */}
      <Card className="rounded-3xl border-(--outline) p-6 shadow-sm mt-6">
        <h2 className="text-heading-3 mb-4 flex items-center gap-2">
          <Laptop className="size-5" /> Активные устройства
        </h2>
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-(--outline) bg-(--bg)">
              <div>
                <p className="text-body-4 font-medium">{s.user_agent || "Неизвестное устройство"}</p>
                <p className="text-body-5 text-(--on-bg-low)">IP: {s.ip_address} • {new Date(s.last_used_at).toLocaleDateString()}</p>
              </div>
              <Button variant="text" size="small" className="text-(--error)" onClick={() => handleRevokeSession(s.id)}>Завершить</Button>
            </div>
          ))}
          {sessions.length === 0 && <p className="text-body-4 text-(--on-bg-medium)">Нет активных сессий</p>}
        </div>
      </Card>

      <Card className="rounded-3xl border border-[color-mix(in_srgb,var(--error),transparent_70%)] bg-[color-mix(in_srgb,var(--error),transparent_96%)] p-6 shadow-sm">
        <h2 className="text-heading-3 mb-2 text-(--error)">Опасная зона</h2>
        <p className="text-body-3 text-(--on-bg-medium) mb-5">
          Удаление аккаунта - необратимое действие. Все данные будут утеряны без возможности восстановления.
        </p>
        <Button variant="glass-red" size="large" onClick={() => setDeleteOpen(true)}>Удалить аккаунт</Button>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Удалить аккаунт?</DialogTitle></DialogHeader>
          <p className="text-body-3 text-(--on-bg-medium) leading-relaxed">
            Это действие нельзя отменить. Аккаунт <b>{user.email}</b> будет удалён навсегда.
          </p>
          <DialogFooter>
            <Button variant="outlined" onClick={() => setDeleteOpen(false)} disabled={isDeleting}>Отмена</Button>
            <Button variant="glass-red" onClick={handleDeleteAccount} disabled={isDeleting}>
              {isDeleting ? "Удаление..." : "Удалить навсегда"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
