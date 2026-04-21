'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { apiFetch } from '@/lib/api'

export default function BlogNewPage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', category: '', content: '', excerpt: '', tags: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const body = {
        title: form.title,
        category: form.category,
        content: form.content,
        excerpt: form.excerpt,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      }
      const res = await apiFetch('/api/blog/posts', { method: 'POST', body: JSON.stringify(body) })
      const post = await res.json()
      router.push(`/blog/${post.id}`)
    } catch {
      setError('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-8">
          <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-1">Blog</p>
          <h1 className="text-3xl font-bold">새 글 작성</h1>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <Field label="제목">
            <input
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="제목을 입력하세요"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              required
            />
          </Field>

          <Field label="카테고리">
            <input
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="예: 일상, 기술, 여행"
              value={form.category}
              onChange={e => set('category', e.target.value)}
              required
            />
          </Field>

          <Field label="요약">
            <input
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="짧은 요약 (선택)"
              value={form.excerpt}
              onChange={e => set('excerpt', e.target.value)}
            />
          </Field>

          <Field label="태그">
            <input
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="쉼표로 구분 (예: 개발, Next.js)"
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
            />
          </Field>

          <Field label="내용">
            <textarea
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              placeholder="내용을 입력하세요"
              rows={12}
              value={form.content}
              onChange={e => set('content', e.target.value)}
              required
            />
          </Field>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
            <button type="button" onClick={() => router.back()} className="text-gray-500 hover:text-gray-300 px-4 py-3 transition-colors">
              취소
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
