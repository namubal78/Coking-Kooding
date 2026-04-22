'use client'

import { useEffect, useRef, useState } from 'react'
import Navbar from '@/components/Navbar'
import { apiFetch, apiUpload } from '@/lib/api'

type Photo = {
  id: number
  fileName: string
  publicUrl: string
  uploadedAt: string
  uploadedBy: string
}

export default function PhotosPage() {
  const fileInput = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Photo | null>(null)

  useEffect(() => {
    apiFetch('/api/photos').then(r => r.json()).then(setPhotos).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const uploaded = await apiUpload('/api/photos/upload', fd).then(r => r.json())
      setPhotos(prev => [uploaded, ...prev])
    } catch {
      setError('업로드 실패. 이미지 파일만 지원합니다.')
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  async function deletePhoto(id: number) {
    if (!confirm('삭제할까요?')) return
    await apiFetch(`/api/photos/${id}`, { method: 'DELETE' })
    setPhotos(prev => prev.filter(p => p.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-1">은새월드</p>
            <h1 className="text-3xl font-bold">사진 앨범</h1>
          </div>
          <div className="flex items-center gap-3">
            {error && <span className="text-red-400 text-sm">{error}</span>}
            <button
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              {uploading ? '업로드 중...' : '사진 추가'}
            </button>
          </div>
          <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={upload} />
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-600 text-lg mb-2">사진이 없습니다</p>
            <p className="text-gray-700 text-sm">첫 사진을 추가해보세요</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {photos.map(p => (
              <div
                key={p.id}
                className="break-inside-avoid relative group cursor-pointer rounded-xl overflow-hidden bg-gray-900"
                onClick={() => setSelected(p)}
              >
                <img
                  src={p.publicUrl}
                  alt={p.fileName}
                  className="w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />
                <button
                  onClick={(e) => { e.stopPropagation(); deletePhoto(p.id) }}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {selected && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelected(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <img src={selected.publicUrl} alt={selected.fileName} className="w-full max-h-[85vh] object-contain rounded-xl" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <p className="text-white/70 text-xs">{selected.fileName} · {new Date(selected.uploadedAt).toLocaleDateString('ko-KR')}</p>
              <button onClick={() => setSelected(null)} className="text-white/60 hover:text-white text-sm cursor-pointer">닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
