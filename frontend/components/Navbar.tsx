'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getToken, parseJwt, getDisplayName } from '@/lib/api'

const PUBLIC_LINKS = [
  { href: '/blog', label: '블로그' },
  { href: '/portfolio', label: '포트폴리오' },
]

const WORLD_LINKS = [
  { href: '/world/planner', label: '플래너' },
  { href: '/world/files', label: '파일' },
  { href: '/world/payments', label: '결제' },
]

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [displayName, setDisplayName] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) return
    setLoggedIn(true)
    const payload = parseJwt(token)
    if (payload?.sub) setDisplayName(getDisplayName(payload.sub))
  }, [])

  function logout() {
    localStorage.removeItem('token')
    router.push('/')
  }

  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href={loggedIn ? '/world/dashboard' : '/'}
          className="text-xl font-bold tracking-tight text-white hover:text-indigo-400 transition-colors"
        >
          Coking<span className="text-indigo-400">Cooding</span>
        </Link>

        <div className="flex items-center gap-5">
          {PUBLIC_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm transition-colors ${isActive(l.href) ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}
            >
              {l.label}
            </Link>
          ))}

          {loggedIn && WORLD_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm transition-colors ${isActive(l.href) ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}
            >
              {l.label}
            </Link>
          ))}

          {loggedIn ? (
            <>
              {displayName && <span className="text-sm text-gray-500">{displayName}</span>}
              <button onClick={logout} className="text-sm text-gray-600 hover:text-red-400 transition-colors cursor-pointer">
                로그아웃
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition-colors"
            >
              은새네 로그인
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
