'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { getToken } from '@/lib/api'

const WORLD_LINKS = [
  { href: '/world/dashboard', label: '홈' },
  { href: '/world/planner', label: '플래너' },
  { href: '/world/workout', label: '운동' },
  { href: '/world/photos', label: '앨범' },
  { href: '/world/draft', label: '드래프트' },
  { href: '/world/chat', label: '채팅' },
]

export default function WorldLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!getToken()) router.replace('/login')
  }, [router])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      <nav className="fixed top-16 left-0 right-0 z-40 h-10 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800/60">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center gap-6">
          <span className="text-[10px] text-gray-600 font-semibold tracking-widest uppercase mr-1">은새월드</span>
          {WORLD_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm transition-colors whitespace-nowrap ${
                isActive(l.href) ? 'text-indigo-400 font-medium' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
      {/* document-flow spacer matching sub-navbar height so children aren't hidden behind it */}
      <div className="h-10" aria-hidden="true" />
      {children}
    </>
  )
}
