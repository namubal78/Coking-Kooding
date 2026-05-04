'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { getToken, parseJwt, getDisplayName, apiFetch } from '@/lib/api'

const PUBLIC_LINKS = [
  { href: '/blog', label: '블로그' },
  { href: '/portfolio', label: '포트폴리오' },
  { href: '/demo', label: '기능 데모' },
]

const WORLD_LINKS = [
  { href: '/world/dashboard', label: '홈' },
  { href: '/world/planner', label: '플래너' },
  { href: '/world/workout', label: '운동' },
  { href: '/world/photos', label: '앨범' },
  { href: '/world/draft', label: '드래프트' },
  { href: '/world/chat', label: '채팅' },
]

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [displayName, setDisplayName] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [worldOpen, setWorldOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const worldRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = getToken()
    if (!token) return
    setLoggedIn(true)
    const payload = parseJwt(token)
    if (payload?.sub) setDisplayName(getDisplayName(payload.sub))
  }, [])

  useEffect(() => {
    if (!loggedIn) return
    if (pathname === '/world/chat') {
      setUnread(0)
      return
    }
    const fetchUnread = () => {
      apiFetch('/api/messenger/unread')
        .then(r => r.json())
        .then(d => setUnread(d.count ?? 0))
        .catch(() => {})
    }
    fetchUnread()
    const id = setInterval(fetchUnread, 30000)
    const onRead = () => setUnread(0)
    window.addEventListener('messagesRead', onRead)
    return () => {
      clearInterval(id)
      window.removeEventListener('messagesRead', onRead)
    }
  }, [loggedIn, pathname])

  // 라우트 변경 시 메뉴 닫기
  useEffect(() => { setMenuOpen(false); setWorldOpen(false) }, [pathname])

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (worldRef.current && !worldRef.current.contains(e.target as Node)) {
        setWorldOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function logout() {
    localStorage.removeItem('token')
    router.push('/')
  }

  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <nav
      className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* 로고 */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={loggedIn ? '/world/dashboard' : '/home'}
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-white hover:text-indigo-400 transition-colors whitespace-nowrap"
          >
            <Image src="/favicon.ico" alt="" width={22} height={22} className="rounded-sm" />
            Coking<span className="text-indigo-400">Cooding</span>
          </Link>
        </div>

        {/* 데스크톱 네비 */}
        <div className="hidden md:flex items-center gap-5">
          <Link href="/about" className="text-sm font-mono text-gray-400 hover:text-indigo-400 transition-colors">
            NAMUBAL78
          </Link>
          {PUBLIC_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm transition-colors ${isActive(l.href) ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}
            >
              {l.label}
            </Link>
          ))}
          {loggedIn ? (
            <div className="relative" ref={worldRef}>
              <button
                onClick={() => setWorldOpen(w => !w)}
                className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 relative"
              >
                {displayName}
                {unread > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
                <svg className={`w-3 h-3 transition-transform ${worldOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {worldOpen && (
                <div className="absolute right-0 top-8 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 min-w-28 py-1.5 overflow-hidden">
                  <p className="text-[10px] text-gray-700 uppercase tracking-widest font-semibold px-4 pt-1.5 pb-1">은새월드</p>
                  {WORLD_LINKS.map(l => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={`flex items-center justify-between px-4 py-2 text-sm transition-colors ${isActive(l.href) ? 'text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-gray-800/60'}`}
                    >
                      {l.label}
                      {l.href === '/world/chat' && unread > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5 ml-1">
                          {unread > 9 ? '9+' : unread}
                        </span>
                      )}
                    </Link>
                  ))}
                  <div className="border-t border-gray-800 my-1" />
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition-colors"
            >
              은새월드
            </Link>
          )}
        </div>

        {/* 모바일 햄버거 */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-400 hover:text-white transition-colors cursor-pointer p-1"
          aria-label="메뉴"
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* 모바일 드롭다운 */}
      {menuOpen && (
        <div className="md:hidden bg-gray-950 border-t border-gray-800 px-6 py-4 space-y-1">
          <Link href="/about" className="block py-2.5 text-base text-gray-400 hover:text-indigo-400 transition-colors font-mono">
            NAMUBAL78
          </Link>
          {PUBLIC_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`block py-2.5 text-base transition-colors ${isActive(l.href) ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}
            >
              {l.label}
            </Link>
          ))}
          {loggedIn && (
            <>
              <div className="border-t border-gray-800 my-2" />
              <p className="text-xs text-gray-700 uppercase tracking-widest font-semibold mb-1">은새월드</p>
              {WORLD_LINKS.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`block py-2.5 text-base transition-colors ${isActive(l.href) ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}
                >
                  {l.label}
                </Link>
              ))}
              <div className="border-t border-gray-800 my-2" />
              {displayName && <p className="text-base text-gray-500 py-1">{displayName}</p>}
              <button onClick={logout} className="block w-full text-left py-2.5 text-base text-gray-600 hover:text-red-400 transition-colors cursor-pointer">
                로그아웃
              </button>
            </>
          )}
          {!loggedIn && (
            <>
              <div className="border-t border-gray-800 my-2" />
              <Link href="/login" className="block py-2.5 text-base text-indigo-400 hover:text-indigo-300 transition-colors">
                은새월드 로그인
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
