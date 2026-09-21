"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useUser } from "@/entities/user/model/user-context"

export function CheckUser({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            toast.error("You are not authenticated")
            router.replace("/login")
        }
    }, [isLoading, user, router])

    if (isLoading || !user) return null
    return <>{children}</>
}
