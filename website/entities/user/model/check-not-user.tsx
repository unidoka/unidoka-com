"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/entities/user/model/user-context"

export function CheckNotUser({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && user) {
            router.replace("/")
        }
    }, [isLoading, user, router])

    if (isLoading || user) return null
    return <>{children}</>
}
