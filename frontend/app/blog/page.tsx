'use client'

import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import { getToken, parseJwt, apiFetch } from '@/lib/api'

const ToastEditor = dynamic(
  () => import('@toast-ui/react-editor').then(m => m.Editor),
  { ssr: false }
)
const ToastViewer = dynamic(
  () => import('@toast-ui/react-editor').then(m => m.Viewer),
  { ssr: false }
)

const ADMIN_EMAIL = 'namubal78@gmail.com'
const FAMILY_CATEGORY = '가족'
const CATEGORIES = ['학습', '트러블슈팅', '가족', '초안'] as const

type Post = {
  id: number
  title: string
  category: string
  content: string
  excerpt: string
  tags: string[]
  authorNickname: string
  authorEmail: string
  createdAt: string
}

const EMPTY_FORM = { title: '', category: '학습', content: '', excerpt: '', tags: '' }

function getCurrentEmail(): string {
  const token = getToken()
  if (!token) return ''
  return parseJwt(token)?.sub ?? ''
}

function isAdmin(): boolean {
  return getCurrentEmail() === ADMIN_EMAIL
}

export default function BlogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950" />}>
      <BlogContent />
    </Suspense>
  )
}

function BlogContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const postId = searchParams.get('id')

  const [posts, setPosts] = useState<Post[]>([])
  const [detail, setDetail] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [admin, setAdmin] = useState(false)
  const [myEmail, setMyEmail] = useState('')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 10

  useEffect(() => {
    const email = getCurrentEmail()
    setMyEmail(email)
    setLoggedIn(!!email)
    setAdmin(isAdmin())
    apiFetch('/api/blog/posts')
      .then(r => r.json())
      .then((data: Post[]) => {
        // 비로그인 시 가족 카테고리 제외 (백엔드도 필터하지만 프론트도 방어)
        const filtered = email ? data : data.filter(p => p.category !== FAMILY_CATEGORY)
        setPosts(filtered)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!postId) { setDetail(null); return }
    apiFetch(`/api/blog/posts/${postId}`)
      .then(r => r.json())
      .then((p: Post) => {
        setDetail(p)
        setForm({ title: p.title, category: p.category, content: p.content, excerpt: p.excerpt ?? '', tags: p.tags?.join(', ') ?? '' })
      })
      .catch(() => router.push('/blog'))
  }, [postId, router])

  function openDetail(id: number) {
    router.push(`/blog?id=${id}`)
    setEditing(false)
  }

  async function openEdit(p: Post) {
    setDetail(p)
    setForm({ title: p.title, category: p.category, content: p.content, excerpt: p.excerpt ?? '', tags: p.tags?.join(', ') ?? '' })
    setEditing(true)
    setCreating(false)
  }

  function backToList() {
    router.push('/blog')
    setDetail(null)
    setEditing(false)
    setCreating(false)
    setPage(0)
  }

  async function savePost(content: string) {
    setSaving(true)
    try {
      const body = {
        title: form.title,
        category: form.category,
        content,
        excerpt: form.excerpt,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      }
      if (creating) {
        const created = await apiFetch('/api/blog/posts', { method: 'POST', body: JSON.stringify(body) }).then(r => r.json())
        setPosts(prev => [created, ...prev])
        backToList()
      } else if (detail) {
        const updated = await apiFetch(`/api/blog/posts/${detail.id}`, { method: 'PUT', body: JSON.stringify(body) }).then(r => r.json())
        setPosts(prev => prev.map(p => p.id === updated.id ? updated : p))
        setDetail(updated)
        setEditing(false)
      }
    } finally {
      setSaving(false)
    }
  }

  async function deletePost(id: number) {
    if (!confirm('삭제할까요?')) return
    await apiFetch(`/api/blog/posts/${id}`, { method: 'DELETE' })
    setPosts(prev => prev.filter(p => p.id !== id))
    backToList()
  }

  if (creating) return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 pt-28 pb-16">
        <h1 className="text-2xl font-bold mb-8">새 글 작성</h1>
        <PostForm form={form} setForm={setForm} saving={saving} onSave={(content) => savePost(content)} onCancel={backToList} />
      </main>
    </div>
  )

  if (detail) return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 pt-28 pb-16">
        {editing ? (
          <>
            <h1 className="text-2xl font-bold mb-8">글 수정</h1>
            <PostForm form={form} setForm={setForm} saving={saving} onSave={(content) => savePost(content)} onCancel={() => setEditing(false)} />
          </>
        ) : (
          <article>
            <span className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded-full">{detail.category}</span>
            <h1 className="text-3xl font-bold mt-3 mb-2">{detail.title}</h1>
            <div className="flex items-center justify-between text-gray-600 text-sm mb-8 pb-6 border-b border-gray-800">
              <span>{detail.authorNickname} · {new Date(detail.createdAt).toLocaleDateString('ko-KR')}</span>
              {(admin || myEmail === detail.authorEmail) && (
                <div className="flex gap-4">
                  <button onClick={() => setEditing(true)} className="hover:text-indigo-400 transition-colors cursor-pointer">수정</button>
                  <button onClick={() => deletePost(detail.id)} className="hover:text-red-400 transition-colors cursor-pointer">삭제</button>
                </div>
              )}
            </div>
            <div className="toastui-viewer-wrap">
              <ToastViewer initialValue={detail.content} theme="dark" />
            </div>
            {detail.tags?.length > 0 && (
              <div className="flex gap-2 mt-8 pt-6 border-t border-gray-800 flex-wrap">
                {detail.tags.map(t => <span key={t} className="text-xs text-gray-600">#{t}</span>)}
              </div>
            )}
            <button onClick={backToList} className="inline-block mt-8 text-sm text-gray-600 hover:text-gray-400 transition-colors cursor-pointer">← 목록으로</button>
          </article>
        )}
      </main>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-1">Blog</p>
            <h1 className="text-3xl font-bold">블로그</h1>
          </div>
          {loggedIn && (
            <button
              onClick={() => { setCreating(true); setForm(EMPTY_FORM) }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              + 새 글 작성
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center py-20 text-gray-600">아직 게시글이 없습니다.</p>
        ) : (
          <>
            <div className="space-y-4">
              {posts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map(p => (
                <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-indigo-500/30 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded-full">{p.category}</span>
                        {p.tags?.map(t => <span key={t} className="text-xs text-gray-600">#{t}</span>)}
                      </div>
                      <h2
                        className="text-lg font-semibold text-white hover:text-indigo-400 transition-colors cursor-pointer"
                        onClick={() => openDetail(p.id)}
                      >
                        {p.title}
                      </h2>
                      {p.excerpt && <p className="text-gray-500 text-sm mt-1 line-clamp-2">{p.excerpt}</p>}
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-gray-700 text-xs">{p.authorNickname} · {new Date(p.createdAt).toLocaleDateString('ko-KR')}</p>
                        <button
                          onClick={() => openDetail(p.id)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                        >
                          읽기 →
                        </button>
                      </div>
                    </div>
                    {(admin || myEmail === p.authorEmail) && (
                      <div className="flex flex-col gap-1 shrink-0">
                        <button onClick={() => openEdit(p)} className="text-gray-500 hover:text-indigo-400 text-sm transition-colors cursor-pointer">수정</button>
                        <button onClick={() => deletePost(p.id)} className="text-gray-700 hover:text-red-400 text-sm transition-colors cursor-pointer">삭제</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {posts.length > PAGE_SIZE && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  ← 이전
                </button>
                <span className="text-sm text-gray-600">
                  {page + 1} / {Math.ceil(posts.length / PAGE_SIZE)}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(Math.ceil(posts.length / PAGE_SIZE) - 1, p + 1))}
                  disabled={(page + 1) * PAGE_SIZE >= posts.length}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  다음 →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function PostForm({ form, setForm, saving, onSave, onCancel }: {
  form: typeof EMPTY_FORM
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>
  saving: boolean
  onSave: (content: string) => void
  onCancel: () => void
}) {
  const editorRef = useRef<any>(null)

  function handleSave() {
    const md = editorRef.current?.getInstance()?.getMarkdown() ?? form.content
    onSave(md)
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">제목</label>
        <input
          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
          value={form.title}
          onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1.5">카테고리</label>
        <select
          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          value={form.category}
          onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1.5">요약</label>
        <input
          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
          value={form.excerpt}
          onChange={e => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1.5">태그 (쉼표 구분)</label>
        <input
          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
          value={form.tags}
          onChange={e => setForm(prev => ({ ...prev, tags: e.target.value }))}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1.5">내용</label>
        <div className="rounded-lg overflow-hidden border border-gray-800">
          <ToastEditor
            ref={editorRef}
            initialValue={form.content || ' '}
            previewStyle="vertical"
            height="480px"
            initialEditType="markdown"
            useCommandShortcut
            theme="dark"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors cursor-pointer">
          {saving ? '저장 중...' : '저장'}
        </button>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-300 px-4 py-3 transition-colors cursor-pointer">취소</button>
      </div>
    </div>
  )
}
