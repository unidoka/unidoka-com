"use client"

import { $fetch } from "@/utils/fetch"
import { safeCookieStorage } from "@/utils/safe-cookie-storage"

export const fetchMe = async () => {
  const access_token = safeCookieStorage.getItem("access_token")
  if (!access_token) return null

  const response = await $fetch("/api/v1/me", { isToast: false })
  return response?.json || null
}
