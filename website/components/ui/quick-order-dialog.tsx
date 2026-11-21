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
import { useLanguage } from "@/providers/language-provider";

export function QuickOrderDialog({
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const { t } = useLanguage();
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
      toast.error(t("order.quick_validation"));
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
        toast.success(t("order.quick_success"));
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
        toast.error(detail || t("order.quick_error"));
      }
    } catch {
      toast.error(t("order.quick_network_error"));
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
              {t("order.quick_title")}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-(--on-bg-high)">{t("order.quick_name")}</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("order.quick_name_placeholder")}
                className="bg-(--card) border-(--outline) h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-(--on-bg-high)">{t("order.quick_email")}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("order.quick_email_placeholder")}
                className="bg-(--card) border-(--outline) h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-(--on-bg-high)">{t("order.quick_phone")}</Label>
              <PhoneInputField
                value={phone ?? ""}
                onChange={setPhone}
                className="bg-(--card) border-(--outline) h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-(--on-bg-high)">{t("order.quick_comment")}</Label>
              <Textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder={t("order.quick_comment_placeholder")}
                className="min-h-[80px] bg-(--card) border-(--outline)"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base  mt-2"
            >
              {loading ? (
                <CircleNotchIcon className="size-5 animate-spin mr-2" />
              ) : null}
              {loading ? t("order.quick_submitting") : t("order.quick_submit")}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
