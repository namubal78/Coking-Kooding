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
  // fenced code blocks first (multiline)
  let result = text.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    (_m, lang: string, code: string) => {
      const label = lang ? `<span class="text-xs text-gray-500 mb-1 block">${lang}</span>` : ''
      return `<pre class="bg-gray-900 border border-gray-700 rounded-lg p-4 my-3 overflow-x-auto text-xs text-indigo-200 leading-relaxed">${label}${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`
    }
  )
  return result
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-bold text-indigo-200 mt-4 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-bold text-indigo-300 mt-5 mb-1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold text-white mt-6 mb-2">$1</h1>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-indigo-600 pl-3 text-gray-400 text-xs my-2">$1</blockquote>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-400 underline hover:text-indigo-300">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-gray-200">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-800 px-1 rounded text-indigo-300 text-xs">$1</code>')
    .replace(/^---$/gm, '<hr class="border-gray-700 my-6"/>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-gray-400 text-sm">$1</li>')
    .replace(/\n/g, '<br/>')
}

function markdownToPlainHtml(text: string): string {
  return text
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang: string, code: string) => {
      const label = lang ? `<div class="code-lang">${lang}</div>` : ''
      return `<pre>${label}<code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
    })
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^---$/gm, '<hr/>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n/g, '<br/>')
}

function downloadPdf(log: DevLog) {
  const html = markdownToPlainHtml(log.content)
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(`<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"/>
<title>${log.title}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
    font-size: 11pt;
    line-height: 1.8;
    color: #1a1a1a;
    padding: 20mm 22mm;
    max-width: 210mm;
    margin: 0 auto;
  }
  h1 { font-size: 18pt; font-weight: 700; margin: 16pt 0 8pt; border-bottom: 2px solid #4f46e5; padding-bottom: 4pt; }
  h2 { font-size: 14pt; font-weight: 700; margin: 14pt 0 6pt; color: #3730a3; }
  h3 { font-size: 12pt; font-weight: 600; margin: 10pt 0 4pt; color: #4338ca; }
  p, br { margin-bottom: 4pt; }
  strong { font-weight: 700; }
  code {
    font-family: 'D2Coding', 'Consolas', monospace;
    font-size: 9.5pt;
    background: #f1f5f9;
    padding: 1pt 4pt;
    border-radius: 3pt;
  }
  pre {
    background: #f8fafc;
    border: 1pt solid #e2e8f0;
    border-left: 3pt solid #6366f1;
    border-radius: 4pt;
    padding: 10pt 12pt;
    margin: 8pt 0;
    overflow: visible;
    white-space: pre-wrap;
    word-break: break-all;
    page-break-inside: avoid;
  }
  pre code { background: none; padding: 0; font-size: 9pt; }
  .code-lang { font-size: 8pt; color: #6366f1; font-weight: 600; margin-bottom: 4pt; }
  blockquote {
    border-left: 3pt solid #6366f1;
    padding: 4pt 10pt;
    color: #475569;
    margin: 6pt 0;
    font-style: italic;
  }
  ul { padding-left: 16pt; margin: 4pt 0; }
  li { margin-bottom: 3pt; }
  hr { border: none; border-top: 1pt solid #e2e8f0; margin: 14pt 0; }
  a { color: #4f46e5; text-decoration: underline; }
  .header {
    text-align: center;
    margin-bottom: 20pt;
    padding-bottom: 10pt;
    border-bottom: 1.5pt solid #e2e8f0;
  }
  .header .main-title { font-size: 16pt; font-weight: 700; color: #1e1b4b; }
  .header .meta { font-size: 9pt; color: #64748b; margin-top: 4pt; }
  @media print {
    body { padding: 0; }
    a { color: #4f46e5; }
  }
</style>
</head>
<body>
<div class="header">
  <div class="main-title">${log.title}</div>
  <div class="meta">Coking-Cooding Dev Draft &nbsp;·&nbsp; ${log.logDate} &nbsp;·&nbsp; 갱신: ${new Date(log.updatedAt).toLocaleString('ko-KR')}</div>
</div>
${html}
<script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`)
  win.document.close()
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
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{selected.title}</h1>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(selected.updatedAt).toLocaleString('ko-KR')} 갱신
                  </p>
                </div>
                <button
                  onClick={() => downloadPdf(selected)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 border border-gray-700 rounded-lg hover:border-indigo-500 hover:text-indigo-400 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  PDF 저장
                </button>
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
