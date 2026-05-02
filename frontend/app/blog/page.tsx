'use client'

import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import { getToken, parseJwt, apiFetch, getDisplayName } from '@/lib/api'

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

type Comment = {
  id: number
  postId: number
  parentId: number | null
  content: string
  authorName: string
  authorEmail: string | null
  anonymous: boolean
  createdAt: string
  children: Comment[]
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
  const PAGE_SIZE = 5

  useEffect(() => {
    const email = getCurrentEmail()
    setMyEmail(email)
    setLoggedIn(!!email)
    setAdmin(isAdmin())
    apiFetch('/api/blog/posts')
      .then(r => r.json())
      .then((data: Post[]) => {
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
              <span>{getDisplayName(detail.authorEmail) || detail.authorNickname} · {new Date(detail.createdAt).toLocaleDateString('ko-KR')}</span>
              {(admin || myEmail === detail.authorEmail) && (
                <div className="flex gap-4">
                  <button onClick={() => setEditing(true)} className="hover:text-indigo-400 transition-colors cursor-pointer">수정</button>
                  <button onClick={() => deletePost(detail.id)} className="hover:text-red-400 transition-colors cursor-pointer">삭제</button>
                </div>
              )}
            </div>

            <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-6 toastui-viewer-wrap">
              <ToastViewer initialValue={detail.content} theme="dark" />
            </div>

            {detail.tags?.length > 0 && (
              <div className="flex gap-2 mt-8 pt-6 border-t border-gray-800 flex-wrap">
                {detail.tags.map(t => <span key={t} className="text-xs text-gray-600">#{t}</span>)}
              </div>
            )}

            <CommentSection postId={detail.id} loggedIn={loggedIn} myEmail={myEmail} admin={admin} />

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
                      <p className="text-gray-700 text-xs mt-3">
                        {getDisplayName(p.authorEmail) || p.authorNickname} · {new Date(p.createdAt).toLocaleDateString('ko-KR')}
                      </p>
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

// ──────────────────────────────────────────────────────
// 댓글 섹션
// ──────────────────────────────────────────────────────

function CommentSection({ postId, loggedIn, myEmail, admin }: {
  postId: number
  loggedIn: boolean
  myEmail: string
  admin: boolean
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  // 새 댓글 폼
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [password, setPassword] = useState('')
  const [parentId, setParentId] = useState<number | null>(null)
  const [replyTargetName, setReplyTargetName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // 수정 상태
  const [editId, setEditId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editError, setEditError] = useState('')

  // 삭제 비밀번호 확인
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/blog/posts/${postId}/comments`)
      .then(r => r.json())
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [postId])

  function cancelReply() {
    setParentId(null)
    setReplyTargetName('')
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const body: Record<string, unknown> = { content: content.trim(), parentId }
      if (!loggedIn) {
        body.authorName = authorName.trim()
        body.password = password
      }
      const token = getToken()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/blog/posts/${postId}/comments`, {
        method: 'POST', headers, body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message ?? '댓글 작성에 실패했습니다.')
      }
      const newComment: Comment = await res.json()
      if (parentId === null) {
        setComments(prev => [...prev, { ...newComment, children: [] }])
      } else {
        setComments(prev => prev.map(c =>
          c.id === parentId ? { ...c, children: [...(c.children ?? []), newComment] } : c
        ))
      }
      setContent('')
      setAuthorName('')
      setPassword('')
      setParentId(null)
      setReplyTargetName('')
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  async function submitEdit(comment: Comment) {
    setEditError('')
    try {
      const body: Record<string, unknown> = { content: editContent.trim() }
      if (comment.anonymous) body.password = editPassword
      const token = getToken()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/blog/comments/${comment.id}`, {
        method: 'PUT', headers, body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message ?? '수정에 실패했습니다.')
      }
      const updated: Comment = await res.json()
      setComments(prev => prev.map(c => {
        if (c.id === comment.id) return { ...updated, children: c.children }
        return { ...c, children: c.children?.map(child => child.id === comment.id ? updated : child) }
      }))
      setEditId(null)
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    }
  }

  async function submitDelete(comment: Comment) {
    setDeleteError('')
    try {
      const token = getToken()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const body = comment.anonymous ? JSON.stringify({ password: deletePassword }) : undefined
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/blog/comments/${comment.id}`, {
        method: 'DELETE', headers, body,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message ?? '삭제에 실패했습니다.')
      }
      setComments(prev => prev
        .filter(c => c.id !== comment.id)
        .map(c => ({ ...c, children: c.children?.filter(child => child.id !== comment.id) }))
      )
      setDeleteId(null)
      setDeletePassword('')
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    }
  }

  function canEdit(comment: Comment) {
    if (admin) return true
    if (!comment.anonymous && myEmail && myEmail === comment.authorEmail) return true
    if (comment.anonymous) return true
    return false
  }

  function commentAuthor(comment: Comment) {
    if (comment.authorEmail) return getDisplayName(comment.authorEmail)
    return comment.authorName ?? '익명'
  }

  const totalCount = comments.reduce((s, c) => s + 1 + (c.children?.length ?? 0), 0)

  return (
    <div className="mt-12 pt-8 border-t border-gray-800">
      <h3 className="text-sm font-semibold text-gray-400 mb-6">댓글 {totalCount > 0 ? totalCount : ''}</h3>

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              canEdit={canEdit(comment)}
              editId={editId}
              editContent={editContent}
              editPassword={editPassword}
              editError={editError}
              deleteId={deleteId}
              deletePassword={deletePassword}
              deleteError={deleteError}
              commentAuthor={commentAuthor}
              onReply={(id, name) => { setParentId(id); setReplyTargetName(name) }}
              onEditStart={(c) => { setEditId(c.id); setEditContent(c.content); setEditPassword(''); setEditError('') }}
              onEditChange={setEditContent}
              onEditPasswordChange={setEditPassword}
              onEditSubmit={submitEdit}
              onEditCancel={() => { setEditId(null); setEditError('') }}
              onDeleteStart={(c) => { setDeleteId(c.id); setDeletePassword(''); setDeleteError('') }}
              onDeletePasswordChange={setDeletePassword}
              onDeleteSubmit={submitDelete}
              onDeleteCancel={() => { setDeleteId(null); setDeleteError('') }}
            />
          ))}
          {comments.length === 0 && (
            <p className="text-gray-700 text-sm text-center py-4">첫 번째 댓글을 남겨보세요.</p>
          )}
        </div>
      )}

      {/* 댓글 작성 폼 */}
      <form onSubmit={submitComment} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 space-y-3">
        {parentId !== null && (
          <div className="flex items-center justify-between text-xs text-indigo-400 bg-indigo-950/30 px-3 py-1.5 rounded-lg">
            <span>↩ {replyTargetName}에게 대댓글 작성 중</span>
            <button type="button" onClick={cancelReply} className="text-gray-500 hover:text-gray-300 cursor-pointer">취소</button>
          </div>
        )}
        {!loggedIn && (
          <div className="flex gap-2">
            <input
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              placeholder="작성자"
              maxLength={50}
              required
              className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="비밀번호"
              required
              className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        )}
        <div className="relative">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value.slice(0, 200))}
            placeholder={loggedIn ? '댓글을 입력하세요.' : '댓글을 입력하세요. (최대 200자)'}
            rows={3}
            maxLength={200}
            required
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            style={{ fontSize: '16px' }}
          />
          <span className="absolute bottom-2 right-3 text-xs text-gray-700">{content.length}/200</span>
        </div>
        {submitError && <p className="text-xs text-red-400">{submitError}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            {submitting ? '등록 중...' : '댓글 등록'}
          </button>
        </div>
      </form>
    </div>
  )
}

function CommentItem({
  comment,
  canEdit,
  editId, editContent, editPassword, editError,
  deleteId, deletePassword, deleteError,
  commentAuthor,
  onReply, onEditStart, onEditChange, onEditPasswordChange, onEditSubmit, onEditCancel,
  onDeleteStart, onDeletePasswordChange, onDeleteSubmit, onDeleteCancel,
  isChild = false,
}: {
  comment: Comment
  canEdit: boolean
  editId: number | null
  editContent: string
  editPassword: string
  editError: string
  deleteId: number | null
  deletePassword: string
  deleteError: string
  commentAuthor: (c: Comment) => string
  onReply: (id: number, name: string) => void
  onEditStart: (c: Comment) => void
  onEditChange: (v: string) => void
  onEditPasswordChange: (v: string) => void
  onEditSubmit: (c: Comment) => void
  onEditCancel: () => void
  onDeleteStart: (c: Comment) => void
  onDeletePasswordChange: (v: string) => void
  onDeleteSubmit: (c: Comment) => void
  onDeleteCancel: () => void
  isChild?: boolean
}) {
  const isEditing = editId === comment.id
  const isDeleting = deleteId === comment.id

  return (
    <div className={isChild ? 'ml-6 pl-4 border-l border-gray-800' : ''}>
      <div className="bg-gray-900/40 border border-gray-800/60 rounded-xl p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-300">{commentAuthor(comment)}</span>
            {comment.anonymous && <span className="text-[10px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">비회원</span>}
            <span className="text-xs text-gray-700">{new Date(comment.createdAt).toLocaleDateString('ko-KR')}</span>
          </div>
          {canEdit && !isEditing && !isDeleting && (
            <div className="flex gap-3 shrink-0">
              {!isChild && (
                <button
                  onClick={() => onReply(comment.id, commentAuthor(comment))}
                  className="text-xs text-gray-600 hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  답글
                </button>
              )}
              <button
                onClick={() => onEditStart(comment)}
                className="text-xs text-gray-600 hover:text-indigo-400 transition-colors cursor-pointer"
              >
                수정
              </button>
              <button
                onClick={() => onDeleteStart(comment)}
                className="text-xs text-gray-600 hover:text-red-400 transition-colors cursor-pointer"
              >
                삭제
              </button>
            </div>
          )}
          {!canEdit && !isChild && (
            <button
              onClick={() => onReply(comment.id, commentAuthor(comment))}
              className="text-xs text-gray-600 hover:text-indigo-400 transition-colors cursor-pointer shrink-0"
            >
              답글
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            {comment.anonymous && (
              <input
                type="password"
                value={editPassword}
                onChange={e => onEditPasswordChange(e.target.value)}
                placeholder="비밀번호 확인"
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            )}
            <textarea
              value={editContent}
              onChange={e => onEditChange(e.target.value.slice(0, 200))}
              rows={3}
              maxLength={200}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              style={{ fontSize: '16px' }}
            />
            {editError && <p className="text-xs text-red-400">{editError}</p>}
            <div className="flex gap-2 justify-end">
              <button onClick={() => onEditSubmit(comment)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer">저장</button>
              <button onClick={onEditCancel} className="text-gray-500 hover:text-gray-300 text-xs px-3 py-1.5 cursor-pointer">취소</button>
            </div>
          </div>
        ) : isDeleting ? (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">정말 삭제하시겠습니까?</p>
            {comment.anonymous && (
              <input
                type="password"
                value={deletePassword}
                onChange={e => onDeletePasswordChange(e.target.value)}
                placeholder="비밀번호 입력"
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            )}
            {deleteError && <p className="text-xs text-red-400">{deleteError}</p>}
            <div className="flex gap-2 justify-end">
              <button onClick={() => onDeleteSubmit(comment)} className="bg-red-800 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer">삭제</button>
              <button onClick={onDeleteCancel} className="text-gray-500 hover:text-gray-300 text-xs px-3 py-1.5 cursor-pointer">취소</button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
        )}
      </div>

      {/* 대댓글 */}
      {comment.children?.map(child => (
        <CommentItem
          key={child.id}
          comment={child}
          canEdit={canEdit}
          editId={editId}
          editContent={editContent}
          editPassword={editPassword}
          editError={editError}
          deleteId={deleteId}
          deletePassword={deletePassword}
          deleteError={deleteError}
          commentAuthor={commentAuthor}
          onReply={onReply}
          onEditStart={onEditStart}
          onEditChange={onEditChange}
          onEditPasswordChange={onEditPasswordChange}
          onEditSubmit={onEditSubmit}
          onEditCancel={onEditCancel}
          onDeleteStart={onDeleteStart}
          onDeletePasswordChange={onDeletePasswordChange}
          onDeleteSubmit={onDeleteSubmit}
          onDeleteCancel={onDeleteCancel}
          isChild
        />
      ))}
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
