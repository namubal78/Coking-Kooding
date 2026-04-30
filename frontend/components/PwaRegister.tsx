'use client'

import { useEffect } from 'react'
import { apiFetch, getToken } from '@/lib/api'

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  return Uint8Array.from(raw, c => c.charCodeAt(0))
}

async function setupPush(reg: ServiceWorkerRegistration) {
  try {
    const keyRes = await apiFetch('/api/push/public-key')
    if (!keyRes.ok) return
    const { publicKey } = await keyRes.json()
    if (!publicKey) return

    let sub = await reg.pushManager.getSubscription()
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })
    }

    await apiFetch('/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(sub.toJSON()),
    })
  } catch {}
}

export default function PwaRegister() {
  // 서비스워커 등록 + 푸시 구독
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !getToken()) return

    navigator.serviceWorker.register('/sw.js').then(async reg => {
      if (!('PushManager' in window) || !('Notification' in window)) return

      if (Notification.permission === 'granted') {
        await setupPush(reg)
      } else if (Notification.permission === 'default') {
        const result = await Notification.requestPermission()
        if (result === 'granted') await setupPush(reg)
      }
    }).catch(() => {})
  }, [])

  // PWA 배지: 안 읽은 채팅 수 (Android/Desktop Chrome 지원)
  useEffect(() => {
    if (!('setAppBadge' in navigator) || !getToken()) return

    const update = async () => {
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

    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [])

  return null
}
