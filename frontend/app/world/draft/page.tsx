'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { apiFetch, getToken } from '@/lib/api'

type DevLog = {
  id: number
  logDate: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

function renderMarkdown(text: string) {
  return text
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-bold text-indigo-300 mt-5 mb-1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold text-white mt-6 mb-2">$1</h1>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-gray-600 pl-3 text-gray-500 italic">$1</blockquote>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-800 px-1 rounded text-indigo-300 text-xs">$1</code>')
    .replace(/^---$/gm, '<hr class="border-gray-700 my-6"/>')
    .replace(/\n/g, '<br/>')
}

export default function DraftPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<DevLog[]>([])
  const [selected, setSelected] = useState<DevLog | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) { router.push('/login'); return }
    apiFetch('/api/dev-logs')
      .then(r => r.json())
      .then(data => {
        setLogs(data)
        if (data.length > 0) setSelected(data[0])
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false))
  }, [router])

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 pt-28 pb-12 flex gap-6">
        <aside className="w-56 shrink-0">
          <p className="text-indigo-400 text-xs font-semibold tracking-widest uppercase mb-3">Dev Draft</p>
          {loading ? (
            <p className="text-gray-600 text-sm">불러오는 중...</p>
          ) : logs.length === 0 ? (
            <p className="text-gray-600 text-sm">작업 기록 없음</p>
          ) : (
            <ul className="space-y-1">
              {logs.map(log => (
                <li key={log.id}>
                  <button
                    onClick={() => setSelected(log)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                      selected?.id === log.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <p className="font-medium">{log.logDate}</p>
                    <p className="text-xs opacity-70 truncate">{log.title.replace(/\d{4}-\d{2}-\d{2} /, '')}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div className="flex-1 min-w-0">
          {selected ? (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold">{selected.title}</h1>
                <p className="text-gray-500 text-xs mt-1">
                  {new Date(selected.updatedAt).toLocaleString('ko-KR')} 갱신
                </p>
              </div>
              <article
                className="text-sm text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(selected.content) }}
              />
            </>
          ) : !loading && (
            <p className="text-gray-600 text-sm">날짜를 선택하세요.</p>
          )}
        </div>
      </main>
    </div>
  )
}
