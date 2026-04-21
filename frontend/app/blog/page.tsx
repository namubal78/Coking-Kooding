'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getToken, apiFetch } from '@/lib/api'

type Post = {
  id: number
  title: string
  category: string
  excerpt: string
  tags: string[]
  authorNickname: string
  createdAt: string
}

export default function BlogPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) { router.replace('/login'); return }
    apiFetch('/api/blog/posts').then(r => r.json()).then(setPosts).finally(() => setLoading(false))
  }, [router])

  async function deletePost(id: number) {
    if (!confirm('삭제할까요?')) return
    await apiFetch(`/api/blog/posts/${id}`, { method: 'DELETE' })
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-1">Blog</p>
            <h1 className="text-3xl font-bold">블로그</h1>
          </div>
          <Link href="/blog/new" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            + 새 글 작성
          </Link>
        </div>

        {loading ? (
          <Spinner />
        ) : posts.length === 0 ? (
          <Empty text="아직 게시글이 없습니다." />
        ) : (
          <div className="space-y-4">
            {posts.map(p => (
              <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-indigo-500/30 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded-full">{p.category}</span>
                      {p.tags?.map(t => <span key={t} className="text-xs text-gray-600">#{t}</span>)}
                    </div>
                    <Link href={`/blog/${p.id}`}>
                      <h2 className="text-lg font-semibold text-white hover:text-indigo-400 transition-colors">{p.title}</h2>
                    </Link>
                    {p.excerpt && <p className="text-gray-500 text-sm mt-1 line-clamp-2">{p.excerpt}</p>}
                    <p className="text-gray-700 text-xs mt-3">{p.authorNickname} · {new Date(p.createdAt).toLocaleDateString('ko-KR')}</p>
                  </div>
                  <button onClick={() => deletePost(p.id)} className="text-gray-700 hover:text-red-400 text-sm transition-colors shrink-0">삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <div className="text-center py-20 text-gray-600">{text}</div>
}
