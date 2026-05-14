'use client'

import { useEffect, useRef, useState } from 'react'
import { API_URL } from '@/lib/api'

export default function ServerWakeupBanner() {
  const [visible, setVisible] = useState(false)
  const [ready, setReady] = useState(false)
  const didWake = useRef(false)

  useEffect(() => {
    if (!API_URL) return

    let cancelled = false
    let slowTimer: ReturnType<typeof setTimeout>
    let interval: ReturnType<typeof setInterval>

    const check = async () => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      try {
        const res = await fetch(`${API_URL}/health`, { signal: controller.signal })
        clearTimeout(timeout)
        if (!cancelled && res.ok) {
          clearTimeout(slowTimer)
          clearInterval(interval)
          if (didWake.current) {
            setReady(true)
            setTimeout(() => setVisible(false), 2000)
          }
        }
      } catch {
        clearTimeout(timeout)
        if (!cancelled && !didWake.current) {
          didWake.current = true
          setVisible(true)
        }
      }
    }

    // 2초 안에 응답 없으면 배너 표시
    slowTimer = setTimeout(() => {
      if (!cancelled && !didWake.current) {
        didWake.current = true
        setVisible(true)
      }
    }, 2000)

    check()
    interval = setInterval(check, 6000)

    return () => {
      cancelled = true
      clearTimeout(slowTimer)
      clearInterval(interval)
    }
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 border border-gray-700 text-sm text-gray-300 px-5 py-3 rounded-2xl shadow-xl">
      {ready ? (
        <>
          <span className="text-green-400 text-base">✓</span>
          <span>서버 준비 완료</span>
        </>
      ) : (
        <>
          <span className="w-4 h-4 border-2 border-gray-600 border-t-indigo-400 rounded-full animate-spin flex-shrink-0" />
          <span>서버 시작 중<span className="text-gray-500"> — 최대 50초 소요</span></span>
        </>
      )}
    </div>
  )
}
