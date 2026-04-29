'use client'

import { useEffect } from 'react'
import { apiFetch, getToken } from '@/lib/api'

export default function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  // PWA 배지: 안 읽은 채팅 수 표시 (Android/Desktop Chrome 지원, iOS 미지원)
  useEffect(() => {
    if (!('setAppBadge' in navigator) || !getToken()) return

    const updateBadge = async () => {
      try {
        const res = await apiFetch('/api/messenger/unread')
        if (!res.ok) return
        const { count } = await res.json()
        if (count > 0) {
          ;(navigator as any).setAppBadge(count)
        } else {
          ;(navigator as any).clearAppBadge()
        }
      } catch {}
    }

    updateBadge()
    const id = setInterval(updateBadge, 30000)
    return () => clearInterval(id)
  }, [])

  return null
}
