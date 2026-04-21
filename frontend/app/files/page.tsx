'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { API_URL, getToken, apiFetch, apiUpload } from '@/lib/api'

type UploadedFile = {
  id: number
  originalName: string
  fileSize: number
  extension: string
  uploadedAt: string
  filePath: string
}

type BlockedExt = {
  id: number
  extension: string
  isFixed: boolean
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FilesPage() {
  const router = useRouter()
  const fileInput = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [blocked, setBlocked] = useState<BlockedExt[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [newExt, setNewExt] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!getToken()) { router.replace('/login'); return }
    Promise.all([
      apiFetch('/api/files').then(r => r.json()),
      apiFetch('/api/files/extensions').then(r => r.json()),
    ]).then(([f, b]) => { setFiles(f); setBlocked(b) }).finally(() => setLoading(false))
  }, [router])

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const uploaded = await apiUpload('/api/files/upload', fd).then(r => r.json())
      setFiles(prev => [uploaded, ...prev])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      setError(msg === '400' ? '차단된 확장자입니다.' : '업로드 실패')
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  async function deleteFile(id: number) {
    if (!confirm('삭제할까요?')) return
    await apiFetch(`/api/files/${id}`, { method: 'DELETE' })
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  async function addExt(e: React.FormEvent) {
    e.preventDefault()
    const ext = newExt.trim().toLowerCase().replace(/^\./, '')
    if (!ext) return
    const created = await apiFetch('/api/files/extensions', { method: 'POST', body: JSON.stringify({ extension: ext }) }).then(r => r.json())
    setBlocked(prev => [...prev, created])
    setNewExt('')
  }

  async function removeExt(ext: string) {
    await apiFetch(`/api/files/extensions/${ext}`, { method: 'DELETE' })
    setBlocked(prev => prev.filter(b => b.extension !== ext))
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-8">
          <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-1">Files</p>
          <h1 className="text-3xl font-bold">파일 관리</h1>
        </div>

        {/* Upload */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-400 mb-4">파일 업로드</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              {uploading ? '업로드 중...' : '파일 선택'}
            </button>
            {error && <span className="text-red-400 text-sm">{error}</span>}
          </div>
          <input ref={fileInput} type="file" className="hidden" onChange={upload} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File List */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-gray-400 mb-3">업로드된 파일</h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : files.length === 0 ? (
              <p className="text-gray-600 text-sm py-8 text-center">업로드된 파일이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {files.map(f => (
                  <div key={f.id} className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <a
                        href={`${API_URL}${f.filePath}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-white hover:text-indigo-400 transition-colors truncate block"
                      >
                        {f.originalName}
                      </a>
                      <p className="text-xs text-gray-600 mt-0.5">{formatSize(f.fileSize)} · {new Date(f.uploadedAt).toLocaleDateString('ko-KR')}</p>
                    </div>
                    <button onClick={() => deleteFile(f.id)} className="text-gray-700 hover:text-red-400 text-sm transition-colors shrink-0 cursor-pointer">삭제</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Blocked Extensions */}
          <div>
            <h2 className="text-sm font-semibold text-gray-400 mb-3">차단 확장자</h2>
            <form onSubmit={addExt} className="flex gap-2 mb-3">
              <input
                className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="예: exe, bat"
                value={newExt}
                onChange={e => setNewExt(e.target.value)}
              />
              <button type="submit" className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer">추가</button>
            </form>
            <div className="space-y-1.5">
              {blocked.map(b => (
                <div key={b.extension} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-300">.{b.extension}</span>
                  {!b.isFixed && (
                    <button onClick={() => removeExt(b.extension)} className="text-gray-700 hover:text-red-400 text-xs transition-colors cursor-pointer">삭제</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
