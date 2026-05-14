'use client'

import Navbar from '@/components/Navbar'
import { HelpButton, HelpModal, HelpSection } from '@/components/HelpModal'
import { useState } from 'react'

export default function DemoChatPage() {
  const [helpOpen, setHelpOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 pt-28 pb-6 flex flex-col">
        <div className="mb-4">
          <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-1">Demo · Chat</p>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold">AI 챗봇</h1>
            <HelpButton onClick={() => setHelpOpen(true)} />
          </div>
          <p className="text-gray-500 text-xs">Spring Boot → Claude API 프록시 데모</p>
        </div>

        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <div className="text-center space-y-3">
            <div className="text-4xl">🔧</div>
            <p className="text-gray-300 font-semibold">AI 챗봇 서비스 일시 중단</p>
            <p className="text-gray-500 text-sm">운영 비용 절감을 위해 AI 기능을 일시 비활성화했습니다.</p>
          </div>
        </div>
      </main>

      {helpOpen && (
        <HelpModal title="🤖 AI 챗봇 — 구현 방식" onClose={() => setHelpOpen(false)}>
          <HelpSection label="아키텍처" items={[
            '프론트 → Spring Boot POST /api/chat → Anthropic API → Claude Haiku 4.5',
            'API Key는 백엔드(Render 환경변수)에만 보관 — 클라이언트에 절대 미노출',
            'Spring Boot가 중간 프록시 역할 (rate limit, 로깅, API 키 보호)',
          ]} />
          <HelpSection label="대화 구현 방식" items={[
            '프론트: messages[] 배열 전체를 매 요청마다 Anthropic API에 전달',
            '서버: 전달받은 배열 그대로 messages API body에 포함',
            '서버 세션 없음 — 대화 기록은 React state에만 존재',
            '탭 닫거나 새로고침 시 대화 초기화',
          ]} />
          <HelpSection label="비용 & 한계" items={[
            'Claude Haiku 4.5: 입력 $0.80/MTok · 출력 $4/MTok',
            '현재 운영 비용 절감을 위해 일시 비활성화 상태',
          ]} />
        </HelpModal>
      )}
    </div>
  )
}
