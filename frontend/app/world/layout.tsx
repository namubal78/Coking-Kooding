'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { apiFetch, getToken } from '@/lib/api'

const WORLD_LINKS = [
  {
    href: '/world/dashboard', label: '홈',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>,
  },
  {
    href: '/world/planner', label: '플래너',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  },
  {
    href: '/world/workout', label: '운동',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  },
  {
    href: '/world/photos', label: '앨범',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  },
  {
    href: '/world/draft', label: '드래프트',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  },
  {
    href: '/world/chat', label: '채팅',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
  },
]

export default function WorldLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!getToken()) router.replace('/login')
  }, [router])

  // 안 읽은 채팅 개수 폴링 (채팅 페이지 제외)
  useEffect(() => {
    if (pathname === '/world/chat') {
      setUnread(0)
      if ('clearAppBadge' in navigator) navigator.clearAppBadge?.()
      return
    }
    const fetchUnread = () => {
      apiFetch('/api/messenger/unread')
        .then(r => r.json())
        .then(d => {
          const count = d.count ?? 0
          setUnread(count)
          if ('setAppBadge' in navigator) {
            if (count > 0) navigator.setAppBadge?.(count)
            else navigator.clearAppBadge?.()
          }
        })
        .catch(() => {})
    }
    fetchUnread()
    const id = setInterval(fetchUnread, 30000)

    // 채팅 페이지에서 읽음 처리 시 즉시 뱃지 제거
    const onRead = () => {
      setUnread(0)
      if ('clearAppBadge' in navigator) navigator.clearAppBadge?.()
    }
    window.addEventListener('messagesRead', onRead)

    return () => {
      clearInterval(id)
      window.removeEventListener('messagesRead', onRead)
    }
  }, [pathname])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      {/* 데스크톱 상단 서브 네비 — top은 Navbar 높이(4rem) + safe-area-inset-top 합산 */}
      <nav
        className="hidden md:block fixed left-0 right-0 z-40 h-10 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800/60"
        style={{ top: 'calc(4rem + env(safe-area-inset-top))' }}
      >
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center gap-6 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          <span className="text-xs text-gray-600 font-semibold tracking-widest uppercase mr-1 shrink-0">은새월드</span>
          {WORLD_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm transition-colors whitespace-nowrap shrink-0 relative ${
                isActive(l.href) ? 'text-indigo-400 font-medium' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {l.label}
              {l.href === '/world/chat' && unread > 0 && (
                <span className="absolute -top-1.5 -right-3 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>
      {/* 데스크톱 전용 spacer */}
      <div className="hidden md:block h-10" aria-hidden="true" />

      {children}

      {/* 모바일 하단 네비 — pb로 홈 인디케이터(safe-area-inset-bottom) 여백 확보 */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800/60"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid h-20" style={{ gridTemplateColumns: `repeat(${WORLD_LINKS.length}, 1fr)` }}>
          {WORLD_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
                isActive(l.href) ? 'text-indigo-400' : 'text-gray-500'
              }`}
            >
              {l.icon}
              <span className="text-xs font-medium leading-none">{l.label}</span>
              {l.href === '/world/chat' && unread > 0 && (
                <span className="absolute top-2 right-1/4 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>
      {/* 모바일 하단 네비 spacer */}
      <div className="md:hidden" style={{ height: 'calc(5rem + env(safe-area-inset-bottom))' }} aria-hidden="true" />
    </>
  )
}
