'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getToken, apiFetch } from '@/lib/api'

type Post = {
  id: number
  title: string
  category: string
  content: string
  excerpt: string
  tags: string[]
  authorNickname: string
  createdAt: string
}

export default function BlogDetailPage() {
  const router = useRouter()
  const { id } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ title: '', category: '', content: '', excerpt: '', tags: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!getToken()) { router.replace('/login'); return }
    apiFetch(`/api/blog/posts/${id}`)
      .then(r => r.json())
      .then((p: Post) => {
        setPost(p)
        setForm({ title: p.title, category: p.category, content: p.content, excerpt: p.excerpt ?? '', tags: p.tags?.join(', ') ?? '' })
      })
      .finally(() => setLoading(false))
  }, [id, router])

  async function saveEdit() {
    if (!post) return
    setSaving(true)
    try {
      const body = {
        title: form.title,
        category: form.category,
        content: form.content,
        excerpt: form.excerpt,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      }
      const updated = await apiFetch(`/api/blog/posts/${post.id}`, { method: 'PUT', body: JSON.stringify(body) }).then(r => r.json())
      setPost(updated)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  async function deletePost() {
    if (!post || !confirm('삭제할까요?')) return
    await apiFetch(`/api/blog/posts/${post.id}`, { method: 'DELETE' })
    router.push('/blog')
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!post) return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-600">게시글을 찾을 수 없습니다.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 pt-28 pb-16">
        {editing ? (
          <div className="space-y-5">
            <h1 className="text-2xl font-bold mb-6">글 수정</h1>
            {(['title', 'category', 'excerpt', 'tags'] as const).map(field => (
              <div key={field}>
                <label className="block text-sm text-gray-400 mb-1.5 capitalize">{field === 'title' ? '제목' : field === 'category' ? '카테고리' : field === 'excerpt' ? '요약' : '태그'}</label>
                <input
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  value={form[field]}
                  onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                />
              </div>
            ))}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">내용</label>
              <textarea
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                rows={12}
                value={form.content}
                onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={saveEdit} disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                {saving ? '저장 중...' : '저장'}
              </button>
              <button onClick={() => setEditing(false)} className="text-gray-500 hover:text-gray-300 px-4 py-3 transition-colors">취소</button>
            </div>
          </div>
        ) : (
          <article>
            <span className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded-full">{post.category}</span>
            <h1 className="text-3xl font-bold mt-3 mb-2">{post.title}</h1>
            <div className="flex items-center justify-between text-gray-600 text-sm mb-8 pb-6 border-b border-gray-800">
              <span>{post.authorNickname} · {new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
              <div className="flex gap-4">
                <button onClick={() => setEditing(true)} className="hover:text-indigo-400 transition-colors">수정</button>
                <button onClick={deletePost} className="hover:text-red-400 transition-colors">삭제</button>
              </div>
            </div>
            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{post.content}</div>
            {post.tags?.length > 0 && (
              <div className="flex gap-2 mt-8 pt-6 border-t border-gray-800 flex-wrap">
                {post.tags.map(t => <span key={t} className="text-xs text-gray-600">#{t}</span>)}
              </div>
            )}
            <Link href="/blog" className="inline-block mt-8 text-sm text-gray-600 hover:text-gray-400 transition-colors">← 목록으로</Link>
          </article>
        )}
      </main>
    </div>
  )
}
