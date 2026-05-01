'use client'

import Link from 'next/link'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { HelpButton, HelpModal, HelpSection } from '@/components/HelpModal'

const DEMOS = [
  {
    key: 'files',
    href: '/demo/files',
    icon: '📁',
    title: '파일 관리',
    desc: '파일 업로드, 다운로드, 확장자 차단 등 파일 관리 기능 데모.',
    tag: 'Spring Boot + JPA',
  },
  {
    key: 'payments',
    href: '/demo/payments',
    icon: '💳',
    title: '결제 내역',
    desc: '포트원(아임포트) 연동 결제 처리 및 내역 조회 데모.',
    tag: 'PortOne API',
  },
  {
    key: 'chat',
    href: '/demo/chat',
    icon: '🤖',
    title: 'AI 챗봇',
    desc: 'Spring Boot 프록시를 통한 Claude AI 챗봇 데모.',
    tag: 'Claude API',
  },
  {
    key: 'planner',
    href: '/demo/planner',
    icon: '🗓️',
    title: '플래너',
    desc: '월간 캘린더 기반 일정 관리. 더미 데이터로 자유롭게 체험.',
    tag: 'React + useState',
  },
  {
    key: 'workout',
    href: '/demo/workout',
    icon: '💪',
    title: '운동 트래커',
    desc: '세트 체크, 타이머, 진행률 추적. 새로고침 전까지 상태 유지.',
    tag: 'Stopwatch + Checklist',
  },
  {
    key: 'photos',
    href: '/demo/photos',
    icon: '📸',
    title: '사진 앨범',
    desc: '가족 앨범 바둑판 그리드 UI. 더미 앨범으로 레이아웃 체험.',
    tag: 'Grid Layout',
  },
  {
    key: 'messenger',
    href: '/demo/messenger',
    icon: '💬',
    title: '가족 메신저',
    desc: '카카오톡 스타일 채팅 UI. 메시지 입력은 로컬 상태로만 동작.',
    tag: 'STOMP / WebSocket UI',
  },
  {
    key: 'draft',
    href: '/demo/draft',
    icon: '📝',
    title: '개발 드래프트',
    desc: 'GitHub Actions → Claude AI가 커밋 내역을 자동 요약하는 개발일지 데모.',
    tag: 'Claude API + GitHub Actions',
  },
]

const HELP_CONTENT: Record<string, React.ReactNode> = {
  files: (
    <>
      <HelpSection label="기술 스택" items={['Spring Boot MultipartFile 업로드', 'Supabase Storage REST API (파일 저장)', 'JPA — uploaded_files 테이블 (이름·크기·경로·업로드 시각)', 'Spring Security JWT 인증']} />
      <HelpSection label="주요 구현 포인트" items={['확장자 차단: blocked_extensions DB 테이블 관리, 업로드 시 서버에서 검증', '파일 크기 제한: spring.servlet.multipart.max-file-size=50MB', 'Supabase SDK 없이 REST API 직접 호출해 Public URL 반환', '비로그인: 목록 조회만 가능 / 로그인: 업로드·삭제 가능']} />
    </>
  ),
  payments: (
    <>
      <HelpSection label="기술 스택" items={['PortOne V1 REST API (구 아임포트)', 'Spring Boot 프록시 — API Key 서버 보관', 'JPA — payments 테이블 (imp_uid, merchant_uid, amount, status)']} />
      <HelpSection label="결제 검증 흐름" items={['① 프론트: PortOne SDK로 결제창 호출 → imp_uid 수신', '② 백엔드: imp_uid로 PortOne API 조회 → 금액 대조 검증', '③ 검증 통과 시 DB 저장 + 응답 반환']} />
      <HelpSection label="현재 상태" items={['PortOne SDK 미연동 — UI 및 API 구조만 완성', '실제 결제 연동 시 프론트에 imp-cdn 스크립트 추가 필요']} />
    </>
  ),
  chat: (
    <>
      <HelpSection label="기술 스택" items={['Claude Haiku 4.5 (claude-haiku-4-5)', 'Spring Boot /api/chat — Anthropic API 프록시', 'API Key: Render 환경변수 (클라이언트 미노출)']} />
      <HelpSection label="구현 포인트" items={['대화 히스토리: 프론트가 messages[] 배열 전체를 매번 전송', '비용 최적화: Haiku 선택 (Sonnet 대비 약 10배 저렴)', 'Prompt Caching 미적용 — 대화당 약 $0.001 미만 수준', 'Rate limit 별도 구현 없음 (데모 수준)']} />
    </>
  ),
  planner: (
    <>
      <HelpSection label="이 데모 vs 실제 버전" items={['데모: React useState만, 새로고침 시 초기화', '실제: Spring Boot JPA + planner_items PostgreSQL 테이블', '실제: Quartz Scheduler로 일정 알림 자동 발송']} />
      <HelpSection label="실제 버전 추가 기능" items={['Web Speech API SpeechRecognition으로 음성 입력', 'Claude NLP로 자연어 파싱 → {title, date, time} 추출', '예: "다음 주 월요일 2시 치과" → date, time 자동 인식', 'VAPID 웹 푸시로 일정 알림']} />
    </>
  ),
  workout: (
    <>
      <HelpSection label="이 데모 구현" items={['타이머: setInterval(1000ms) + useRef로 interval 관리', '세트 체크: Record<"exId-setIdx", boolean> 상태', '진행률: 모든 세트 완료 운동 수 / 전체 운동 수', '새로고침 시 초기화 (localStorage 미저장)']} />
      <HelpSection label="실제 버전 추가 기능" items={['Spring Boot JPA — exercises, workout_logs PostgreSQL 저장', 'Supabase Storage workout-videos 버킷에 운동 영상 저장', 'TTS: speechSynthesis.speak()로 세트 완료 음성 안내', '운동 통계 API (주간·월간 집계)']} />
    </>
  ),
  photos: (
    <>
      <HelpSection label="레이아웃" items={['CSS Grid grid-cols-2 sm:grid-cols-3 바둑판 구성', 'aspect-square로 셀을 항상 정사각형 유지', '용량 표시: 파일 크기 합산을 MB 단위로 표시']} />
      <HelpSection label="실제 버전" items={['Supabase Storage photos 버킷 (Public read)', '프론트 → Spring Boot → Supabase REST API 업로드', 'Public URL을 DB에 저장 후 그리드에 렌더링', '업로드 시 WebP 변환·리사이징 고려 (미구현)']} />
    </>
  ),
  messenger: (
    <>
      <HelpSection label="이 데모" items={['React state만 사용 — 실제 WebSocket 연결 없음', '새로고침 시 초기화 (더미 메시지로 리셋)']} />
      <HelpSection label="실제 버전 스택" items={['STOMP + SockJS (@stomp/stompjs, sockjs-client)', 'Spring Boot WebSocketMessageBroker — /ws endpoint', '구독: /topic/family | 발행: /app/chat.send', 'messages 테이블 DB 영속화 + message_reads 읽음 표시', 'VAPID 웹 푸시로 백그라운드 알림']} />
    </>
  ),
  draft: (
    <>
      <HelpSection label="자동 생성 흐름" items={['① GitHub push → dev-log.yml 워크플로우 실행', '② 2분 대기 (빌드·배포 안정화)', '③ 백엔드 /api/dev-logs/webhook 호출 (커밋 목록 전달)', '④ Spring Boot → Claude Haiku로 자동 요약 생성', '⑤ dev_logs PostgreSQL 테이블 저장 + Slack 알림']} />
      <HelpSection label="편집 기능" items={['Toast UI Editor로 Markdown 재편집 가능', 'PUT /api/dev-logs/{id}로 내용 덮어쓰기', 'Slack Bot으로 생성/수정 알림 전송']} />
    </>
  ),
}

export default function DemoPage() {
  const [openKey, setOpenKey] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-10">
          <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-2">Demo</p>
          <h1 className="text-3xl font-bold">기능 체험</h1>
          <p className="text-gray-500 text-sm mt-2">코킹쿠딩에서 구현한 기능들을 직접 체험해보세요. 은새월드 기능은 더미 데이터로 개인정보 없이 체험 가능합니다.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {DEMOS.map((d) => (
            <div key={d.key} className="relative group">
              <Link
                href={d.href}
                className="block bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-indigo-500/40 hover:bg-gray-900/80 transition-all duration-200 flex flex-col h-full"
              >
                <div className="text-3xl mb-3">{d.icon}</div>
                <h2 className="font-semibold text-white mb-1 group-hover:text-indigo-400 transition-colors pr-6">{d.title}</h2>
                <p className="text-gray-500 text-sm flex-1">{d.desc}</p>
                <span className="mt-4 text-xs text-indigo-500/70 font-mono">{d.tag}</span>
              </Link>
              <div className="absolute top-4 right-4 z-10">
                <HelpButton onClick={() => setOpenKey(d.key)} />
              </div>
            </div>
          ))}
        </div>
      </main>

      {openKey && HELP_CONTENT[openKey] && (
        <HelpModal
          title={`${DEMOS.find(d => d.key === openKey)?.icon} ${DEMOS.find(d => d.key === openKey)?.title} — 구현 방식`}
          onClose={() => setOpenKey(null)}
        >
          {HELP_CONTENT[openKey]}
        </HelpModal>
      )}
    </div>
  )
}
