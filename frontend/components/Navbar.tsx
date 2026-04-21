'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getToken, parseJwt, getDisplayName } from '@/lib/api'

const NAV_LINKS = [
  { href: '/blog', label: '블로그' },
  { href: '/planner', label: '플래너' },
  { href: '/files', label: '파일' },
  { href: '/payments', label: '결제' },
]

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    const token = getToken()
    if (!token) return
    const payload = parseJwt(token)
    if (payload?.sub) setDisplayName(getDisplayName(payload.sub))
  }, [])

  function logout() {
    localStorage.removeItem('token')
    router.push('/')
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight text-white hover:text-indigo-400 transition-colors">
          Coking<span className="text-indigo-400">Cooding</span>
        </Link>
        <div className="flex items-center gap-5">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm transition-colors ${pathname.startsWith(l.href) ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}
            >
              {l.label}
            </Link>
          ))}
          {displayName && <span className="text-sm text-gray-500">{displayName}</span>}
          <button onClick={logout} className="text-sm text-gray-600 hover:text-red-400 transition-colors cursor-pointer">
            로그아웃
          </button>
        </div>
      </div>
    </nav>
  )
}
