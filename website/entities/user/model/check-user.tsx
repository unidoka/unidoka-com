"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ShieldWarning } from "@phosphor-icons/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useUser } from "@/entities/user/model/user-context"
import { useAdminSecret } from "@/hooks/use-admin-secret"
import { hasPermission, type AdminPermission } from "@/utils/permissions"

/**
 * Auth + (optional) permission gate.
 *
 * Behaviour without `permission` is unchanged from the original —
 * unauthenticated visitors get bounced to /login.
 *
 * With `permission`, an authenticated user who lacks the grant sees a
 * "no access" block instead of the page. That block is UX; the same
 * request against any backend endpoint returns 403. Bookmarked URLs
 * and direct API calls are both covered.
 *
 * The permission check runs after the loading guard, so it never
 * fires against a half-resolved session — that would briefly flash
 * the forbidden block for users who do have access.
 */
export function CheckUser({
  children,
  permission,
}: {
  children: React.ReactNode
  permission?: AdminPermission
}) {
  const { user, isLoading } = useUser()
  const { secret } = useAdminSecret()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      toast.error("You are not authenticated")
      router.replace("/login")
    }
  }, [isLoading, user, router])

  if (isLoading || !user) return null

  if (permission && !hasPermission(user, permission)) {
    const homeHref = secret ? `/admin/${secret}` : "/"
    return (
      <Card className="rounded-3xl border-(--outline) p-10 text-center">
        <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-(--primary-card) text-(--primary) mb-4">
          <ShieldWarning className="size-6" weight="duotone" />
        </div>
        <h2 className="text-heading-2 mb-2">Доступ ограничен</h2>
        <p className="text-body-4 text-(--on-bg-medium) mb-6 max-w-md mx-auto leading-relaxed">
          У вас нет прав для просмотра этого раздела. Обратитесь к
          супер-администратору, чтобы получить доступ.
        </p>
        <Button asChild>
          <Link href={homeHref}>На дашборд</Link>
        </Button>
      </Card>
    )
  }

  return <>{children}</>
}
