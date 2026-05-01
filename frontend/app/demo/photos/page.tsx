'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { HelpButton, HelpModal, HelpSection } from '@/components/HelpModal'

const DUMMY_ALBUMS = [
  { id: 1, name: '가족 나들이', date: '2026-04-20', gradient: 'from-indigo-600 to-violet-600', emoji: '🌸', count: 12 },
  { id: 2, name: '은새 생일', date: '2026-03-15', gradient: 'from-amber-500 to-orange-500', emoji: '🎂', count: 24 },
  { id: 3, name: '제주도 여행', date: '2026-01-05', gradient: 'from-sky-500 to-cyan-500', emoji: '🌊', count: 47 },
  { id: 4, name: '크리스마스', date: '2025-12-25', gradient: 'from-red-500 to-rose-500', emoji: '🎄', count: 19 },
  { id: 5, name: '운동회', date: '2025-10-12', gradient: 'from-emerald-500 to-teal-500', emoji: '🏃', count: 33 },
  { id: 6, name: '할머니댁 방문', date: '2025-09-28', gradient: 'from-purple-600 to-pink-500', emoji: '🏡', count: 8 },
]

const MB_PER_PHOTO = 1.2
const TOTAL_MB = DUMMY_ALBUMS.reduce((s, a) => s + a.count * MB_PER_PHOTO, 0)
const LIMIT_MB = 1024

export default function DemoPhotosPage() {
  const [helpOpen, setHelpOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-1">Demo · Photos</p>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">사진 앨범</h1>
              <HelpButton onClick={() => setHelpOpen(true)} />
            </div>
            <p className="text-gray-500 text-sm mt-2">더미 데이터로 체험하는 가족 앨범 UI.</p>
          </div>
          <div className="text-right text-sm">
            <p className="text-xs text-gray-600 mb-1">저장 용량</p>
            <p className="text-white font-semibold">
              {TOTAL_MB.toFixed(0)} MB{' '}
              <span className="text-gray-600 font-normal">/ {LIMIT_MB} MB</span>
            </p>
            <div className="mt-1 w-32 bg-gray-800 rounded-full h-1.5">
              <div
                className="bg-indigo-500 h-1.5 rounded-full"
                style={{ width: `${(TOTAL_MB / LIMIT_MB) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {DUMMY_ALBUMS.map(album => (
            <div key={album.id} className="group cursor-default">
              <div className={`aspect-square rounded-xl bg-gradient-to-br ${album.gradient} flex items-center justify-center text-5xl relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-200`}>
                <span>{album.emoji}</span>
                <div className="absolute bottom-2 right-2 bg-black/50 text-xs text-white px-2 py-0.5 rounded-full">
                  {album.count}장
                </div>
              </div>
              <p className="text-sm font-medium text-white mt-2 truncate">{album.name}</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {album.date} · {(album.count * MB_PER_PHOTO).toFixed(1)} MB
              </p>
            </div>
          ))}
        </div>
      </main>

      {helpOpen && (
        <HelpModal title="📸 사진 앨범 — 구현 방식" onClose={() => setHelpOpen(false)}>
          <HelpSection label="업로드 흐름" items={[
            '① 클라이언트 → Spring Boot POST /api/photos/upload (MultipartFile)',
            '② 백엔드: Supabase Storage REST API PUT (Authorization: Bearer service-key)',
            '③ Supabase photos 버킷에 저장 → Public URL 생성',
            '④ photos 테이블: file_name, public_url, file_size, uploaded_at, uploaded_by',
            '⑤ 클라이언트: Public URL을 img src에 직접 사용',
          ]} />
          <HelpSection label="레이아웃 구현" items={[
            'CSS Grid grid-cols-2 sm:grid-cols-3 바둑판 그리드',
            'aspect-square: 셀 항상 정사각형 유지',
            'object-cover: 이미지가 셀을 꽉 채우도록',
            '용량 표시: GET /api/photos/storage → 파일 크기 합산 MB',
            '전체 한도: 1GB (Supabase 무료 플랜)',
          ]} />
          <HelpSection label="권한" items={[
            'Supabase 버킷: Public read (비로그인도 이미지 URL 접근 가능)',
            '업로드·삭제: 가족 JWT 인증 필요 (Spring Boot에서 검증)',
            'Service Key는 Render 환경변수에만 보관',
          ]} />
        </HelpModal>
      )}
    </div>
  )
}
