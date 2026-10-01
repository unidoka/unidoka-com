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
      try { await logout(); } catch {}
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

      <Card className="rounded-3xl border-(--outline) p-6 shadow-sm">
        <h2 className="text-heading-3 mb-2">Двухфакторная аутентификация</h2>
        <p className="text-body-3 text-(--on-bg-medium)">Здесь можно будет включить 2FA (в разработке).</p>
      </Card>

      <Card className="rounded-3xl border border-[color-mix(in_srgb,var(--error),transparent_70%)] bg-[color-mix(in_srgb,var(--error),transparent_96%)] p-6 shadow-sm">
        <h2 className="text-heading-3 mb-2 text-(--error)">Опасная зона</h2>
        <p className="text-body-3 text-(--on-bg-medium) mb-5">
          Удаление аккаунта — необратимое действие. Все данные будут утеряны без возможности восстановления.
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
