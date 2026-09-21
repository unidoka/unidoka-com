"use client"

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react"
import { fetchMe } from "@/entities/user/api/fetch-me"
import { getTokenExpiration } from "@/utils/get-token-expiration"
import { $fetch } from "@/utils/fetch"
import { safeCookieStorage } from "@/utils/safe-cookie-storage"
import { useRouter } from "next/navigation"

interface UserContextType {
  user: any
  setUser: (user: any) => void
  token: string | null
  setToken: (token: string | null) => void
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  logout: () => void
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

export default function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()

  const getUser = useCallback(async () => {
    setIsLoading(true)
    const user_ = await fetchMe()
    setUser(user_)
    setIsLoading(false)
  }, [])

  async function init() {
    const refresh_token = safeCookieStorage.getItem("refresh_token")
    const access_token = safeCookieStorage.getItem("access_token")

    if (!refresh_token || !access_token) {
      setIsLoading(false)
      return
    }

    const expTime = getTokenExpiration(access_token)
    const isExpired = expTime ? Date.now() >= expTime : true

    if (isExpired) {
      const response = await $fetch("/api/v1/refresh", {
        method: "POST",
        body: JSON.stringify({ refresh_token }),
        headers: { "Content-Type": "application/json" }
      })
      const new_access_token = response?.json?.access_token
      if (new_access_token) {
        safeCookieStorage.setItem("access_token", new_access_token)
        setToken(new_access_token)
      }
    } else {
      setToken(access_token)
    }
  }

  useEffect(() => {
    init()
  }, [])

  function clearAuth() {
    safeCookieStorage.removeItem("access_token")
    safeCookieStorage.removeItem("refresh_token")
    setToken(null)
    setUser(null)
    setIsLoading(false)
  }

  useEffect(() => {
    if (token) {
      safeCookieStorage.setItem("access_token", token)
      getUser()
    } else if (token === null && !isLoading) {
      clearAuth()
    }
  }, [token, getUser])

  async function logout() {
    const refresh_token = safeCookieStorage.getItem("refresh_token")
    await $fetch("/api/v1/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token }),
      headers: { "Content-Type": "application/json" }
    })
    clearAuth()
    router.push("/login")
  }

  return (
    <UserContext.Provider value={{ user, setUser, token, setToken, isLoading, setIsLoading, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
