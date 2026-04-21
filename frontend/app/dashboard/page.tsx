'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getToken, parseJwt } from '@/lib/api'

const CARDS = [
  { href: '/blog', icon: '✍️', title: '블로그', desc: '게시글 작성 및 관리' },
  { href: '/planner', icon: '🗓️', title: '플래너', desc: '일정 및 업무 관리' },
  { href: '/files', icon: '📁', title: '파일 관리', desc: '파일 업로드 및 확장자 제어' },
  { href: '/payments', icon: '💳', title: '결제', desc: '결제 내역 확인' },
]

export default function DashboardPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')

  useEffect(() => {
    const token = getToken()
    if (!token) { router.replace('/login'); return }
    const payload = parseJwt(token)
    if (payload?.sub) setEmail(payload.sub)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-10">
          <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-2">Dashboard</p>
          <h1 className="text-3xl font-bold">안녕하세요 👋</h1>
          {email && <p className="text-gray-500 text-sm mt-1">{email}</p>}
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
