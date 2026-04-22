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

const EMPTY_FORM = { title: '', description: '', date: '' }

export default function PlannerPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiFetch('/api/planner').then(r => r.json()).then(setItems).finally(() => setLoading(false))
  }, [])

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId !== null) {
        const updated = await apiFetch(`/api/planner/${editingId}`, { method: 'PUT', body: JSON.stringify(form) }).then(r => r.json())
        setItems(prev => prev.map(i => i.id === editingId ? updated : i))
        setEditingId(null)
      } else {
        const created = await apiFetch('/api/planner', { method: 'POST', body: JSON.stringify(form) }).then(r => r.json())
        setItems(prev => [...prev, created].sort((a, b) => a.date.localeCompare(b.date)))
      }
      setForm(EMPTY_FORM)
    } finally {
      setSaving(false)
    }
  }

  function startEdit(item: Item) {
    setEditingId(item.id)
    setForm({ title: item.title, description: item.description ?? '', date: item.date })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  async function deleteItem(id: number) {
    if (!confirm('삭제할까요?')) return
    await apiFetch(`/api/planner/${id}`, { method: 'DELETE' })
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-8">
          <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-1">Planner</p>
          <h1 className="text-3xl font-bold">플래너</h1>
        </div>

        <form onSubmit={submit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8 space-y-4">
          <h2 className="text-sm font-semibold text-gray-400">{editingId ? '일정 수정' : '새 일정 추가'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="제목"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              required
            />
            <input
              type="date"
              className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors [color-scheme:dark]"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              required
            />
          </div>
          <input
            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="설명 (선택)"
            value={form.description}
            onChange={e => set('description', e.target.value)}
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              {saving ? '저장 중...' : editingId ? '수정 완료' : '추가'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="text-gray-500 hover:text-gray-300 text-sm px-4 transition-colors cursor-pointer">취소</button>
            )}
          </div>
        </form>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-center py-12 text-gray-600">등록된 일정이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div
                key={item.id}
                className={`bg-gray-900 border rounded-xl px-5 py-4 flex items-start justify-between gap-4 transition-all ${editingId === item.id ? 'border-indigo-500/50' : 'border-gray-800'}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-0.5">
                    <span className="text-xs text-indigo-400 font-medium">{item.date}</span>
                    <h3 className="font-medium text-white truncate">{item.title}</h3>
                  </div>
                  {item.description && <p className="text-gray-500 text-sm">{item.description}</p>}
                </div>
                <div className="flex gap-3 shrink-0">
                  <button onClick={() => startEdit(item)} className="text-sm text-gray-600 hover:text-indigo-400 transition-colors cursor-pointer">수정</button>
                  <button onClick={() => deleteItem(item.id)} className="text-sm text-gray-600 hover:text-red-400 transition-colors cursor-pointer">삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
