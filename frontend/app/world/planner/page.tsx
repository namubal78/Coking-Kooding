'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { apiFetch } from '@/lib/api'

type Item = {
  id: number
  title: string
  description: string
  date: string
}

const EVENT_COLORS = [
  'bg-indigo-500', 'bg-violet-500', 'bg-sky-500',
  'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-pink-500',
]

function eventColor(id: number) {
  return EVENT_COLORS[id % EVENT_COLORS.length]
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const EMPTY_FORM = { title: '', description: '', date: '' }

export default function PlannerPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [today] = useState(new Date())
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [view, setView] = useState<'month' | 'week'>('month')
  const [sidebar, setSidebar] = useState<'detail' | 'new' | null>(null)
  const [selected, setSelected] = useState<Item | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    apiFetch('/api/planner').then(r => r.json()).then(setItems).finally(() => setLoading(false))
  }, [])

  function prevPeriod() {
    setCursor(c => {
      if (view === 'month') {
        const m = c.month === 0 ? 11 : c.month - 1
        const y = c.month === 0 ? c.year - 1 : c.year
        return { year: y, month: m }
      }
      return c
    })
  }

  function nextPeriod() {
    setCursor(c => {
      if (view === 'month') {
        const m = c.month === 11 ? 0 : c.month + 1
        const y = c.month === 11 ? c.year + 1 : c.year
        return { year: y, month: m }
      }
      return c
    })
  }

  function openNew(date: string) {
    setForm({ ...EMPTY_FORM, date })
    setEditing(false)
    setSidebar('new')
    setSelected(null)
  }

  function openDetail(item: Item) {
    setSelected(item)
    setEditing(false)
    setSidebar('detail')
  }

  function startEdit() {
    if (!selected) return
    setForm({ title: selected.title, description: selected.description ?? '', date: selected.date })
    setEditing(true)
    setSidebar('new')
  }

  async function save() {
    setSaving(true)
    try {
      if (editing && selected) {
        const updated = await apiFetch(`/api/planner/${selected.id}`, { method: 'PUT', body: JSON.stringify(form) }).then(r => r.json())
        setItems(prev => prev.map(i => i.id === updated.id ? updated : i))
        setSelected(updated)
        setEditing(false)
        setSidebar('detail')
      } else {
        const created = await apiFetch('/api/planner', { method: 'POST', body: JSON.stringify(form) }).then(r => r.json())
        setItems(prev => [...prev, created])
        setSelected(created)
        setSidebar('detail')
      }
      setForm(EMPTY_FORM)
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!selected || !confirm('삭제할까요?')) return
    await apiFetch(`/api/planner/${selected.id}`, { method: 'DELETE' })
    setItems(prev => prev.filter(i => i.id !== selected.id))
    setSidebar(null)
    setSelected(null)
  }

  // Build month grid
  const firstDay = new Date(cursor.year, cursor.month, 1)
  const startOffset = firstDay.getDay() // 0=Sun
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7
  const cells: (Date | null)[] = Array.from({ length: totalCells }, (_, i) => {
    const d = i - startOffset + 1
    return d >= 1 && d <= daysInMonth ? new Date(cursor.year, cursor.month, d) : null
  })

  function dateKey(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  function isToday(d: Date) {
    return d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
  }

  const itemsByDate = items.reduce<Record<string, Item[]>>((acc, item) => {
    if (!acc[item.date]) acc[item.date] = []
    acc[item.date].push(item)
    return acc
  }, {})

  const monthLabel = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long' }).format(new Date(cursor.year, cursor.month, 1))

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 pt-20 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between py-4 px-2">
          <div className="flex items-center gap-3">
            <button onClick={prevPeriod} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors cursor-pointer text-gray-400">‹</button>
            <h2 className="text-lg font-bold min-w-[140px] text-center">{monthLabel}</h2>
            <button onClick={nextPeriod} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors cursor-pointer text-gray-400">›</button>
            <button
              onClick={() => setCursor({ year: today.getFullYear(), month: today.getMonth() })}
              className="text-xs text-indigo-400 hover:text-indigo-300 px-2 py-1 border border-indigo-800 rounded-md transition-colors cursor-pointer ml-1"
            >
              오늘
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg overflow-hidden border border-gray-800 text-sm">
              {(['month', 'week'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 transition-colors cursor-pointer ${view === v ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}
                >
                  {v === 'month' ? '월' : '주'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-1 gap-4 min-h-0">
          {/* Calendar */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-l border-t border-gray-800">
              {WEEKDAYS.map((d, i) => (
                <div key={d} className={`border-r border-b border-gray-800 py-2 text-center text-xs font-semibold ${i === 0 ? 'text-rose-400' : i === 6 ? 'text-sky-400' : 'text-gray-500'}`}>
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-7 flex-1 border-l border-gray-800">
                {cells.map((day, i) => {
                  const key = day ? dateKey(day) : `empty-${i}`
                  const dayItems = day ? (itemsByDate[dateKey(day)] ?? []) : []
                  const isWeekend = i % 7 === 0 || i % 7 === 6
                  return (
                    <div
                      key={key}
                      className={`border-r border-b border-gray-800 min-h-[90px] flex flex-col p-1 transition-colors ${day ? 'hover:bg-gray-900/50 cursor-pointer' : 'bg-gray-950/30'}`}
                      onClick={() => day && openNew(dateKey(day))}
                    >
                      {day && (
                        <>
                          <span className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full self-end
                            ${isToday(day) ? 'bg-indigo-600 text-white' : isWeekend ? (i % 7 === 0 ? 'text-rose-400' : 'text-sky-400') : 'text-gray-400'}`}
                          >
                            {day.getDate()}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            {dayItems.slice(0, 3).map(item => (
                              <button
                                key={item.id}
                                onClick={e => { e.stopPropagation(); openDetail(item) }}
                                className={`${eventColor(item.id)} text-white text-[10px] font-medium px-1.5 py-0.5 rounded truncate text-left w-full hover:opacity-80 transition-opacity cursor-pointer`}
                              >
                                {item.title}
                              </button>
                            ))}
                            {dayItems.length > 3 && (
                              <span className="text-[10px] text-gray-500 pl-1">+{dayItems.length - 3}개</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          {sidebar && (
            <div className="w-72 shrink-0 bg-gray-900 border border-gray-800 rounded-xl flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <h3 className="text-sm font-semibold text-gray-300">
                  {sidebar === 'new' ? (editing ? '일정 수정' : '새 일정') : '일정 상세'}
                </h3>
                <button onClick={() => { setSidebar(null); setEditing(false) }} className="text-gray-600 hover:text-gray-300 cursor-pointer">✕</button>
              </div>

              {sidebar === 'detail' && selected && !editing && (
                <div className="flex-1 p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${eventColor(selected.id)}`} />
                    <div className="min-w-0">
                      <p className="font-semibold text-white leading-snug">{selected.title}</p>
                      <p className="text-xs text-indigo-300 mt-1">{selected.date}</p>
                    </div>
                  </div>
                  {selected.description && (
                    <p className="text-sm text-gray-400 leading-relaxed">{selected.description}</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button onClick={startEdit} className="flex-1 text-sm bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors cursor-pointer">수정</button>
                    <button onClick={remove} className="flex-1 text-sm bg-red-900/30 hover:bg-red-900/60 text-red-400 py-2 rounded-lg transition-colors cursor-pointer">삭제</button>
                  </div>
                </div>
              )}

              {(sidebar === 'new' || editing) && (
                <div className="flex-1 p-4 space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">제목</label>
                    <input
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="일정 제목"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">날짜</label>
                    <input
                      type="date"
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors [color-scheme:dark]"
                      value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">설명 (선택)</label>
                    <textarea
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                      rows={4}
                      placeholder="메모"
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={save}
                      disabled={saving || !form.title || !form.date}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                    >
                      {saving ? '저장 중...' : '저장'}
                    </button>
                    <button
                      onClick={() => { setSidebar(null); setEditing(false) }}
                      className="flex-1 text-gray-500 hover:text-gray-300 text-sm py-2 rounded-lg border border-gray-700 transition-colors cursor-pointer"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
