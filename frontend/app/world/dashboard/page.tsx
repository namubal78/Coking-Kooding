'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { parseJwt, getDisplayName, getToken } from '@/lib/api'

const CARDS = [
  { href: '/world/planner', icon: '🗓️', title: '플래너', desc: '일정 및 업무 관리' },
  { href: '/world/files', icon: '📁', title: '파일 관리', desc: '파일 업로드 및 확장자 제어' },
  { href: '/world/payments', icon: '💳', title: '결제', desc: '결제 내역 확인' },
  { href: '/blog', icon: '✍️', title: '블로그', desc: '게시글 작성 및 관리' },
]

export default function DashboardPage() {
  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    const token = getToken()
    if (!token) return
    const payload = parseJwt(token)
    if (payload?.sub) setDisplayName(getDisplayName(payload.sub))
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-10">
          <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-2">은새월드</p>
          <h1 className="text-3xl font-bold">안녕하세요 👋</h1>
          {displayName && <p className="text-gray-500 text-sm mt-1">{displayName}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {CARDS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-indigo-500/40 hover:bg-gray-900/80 transition-all duration-200 group"
            >
              <div className="text-3xl mb-3">{c.icon}</div>
              <h2 className="font-semibold text-white mb-1 group-hover:text-indigo-400 transition-colors">{c.title}</h2>
              <p className="text-gray-500 text-sm">{c.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
