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
      <HelpSection label="업로드 흐름" items={[
        '① 클라이언트: MultipartForm으로 Spring Boot에 파일 전송',
        '② 백엔드: 확장자 차단 목록(blocked_extensions 테이블) 검증',
        '③ Spring Boot → Supabase Storage REST API 직접 호출 (SDK 없음)',
        '   Authorization: Bearer {service-key} 헤더로 인증',
        '④ Supabase가 반환한 Public URL을 DB(uploaded_files 테이블)에 저장',
        '⑤ 클라이언트는 URL을 직접 사용해 다운로드',
      ]} />
      <HelpSection label="DB 스키마" items={[
        'uploaded_files: id, original_name, stored_path, file_size, extension, uploaded_at, uploaded_by',
        'blocked_extensions: id, extension(예: exe·bat·sh), is_fixed(시스템 고정 여부)',
      ]} />
      <HelpSection label="보안 & 제한" items={[
        '파일 크기 제한: spring.servlet.multipart.max-file-size=50MB',
        '확장자 차단: 업로드 시 서버에서 검증 — 차단된 확장자면 400 반환',
        '권한: 비로그인=목록 조회만 / 가족 로그인=업로드·삭제 가능',
        'Supabase Storage 버킷 Public read 설정 (다운로드는 인증 불필요)',
      ]} />
    </>
  ),
  payments: (
    <>
      <HelpSection label="결제 검증 흐름" items={[
        '① 프론트: PortOne JS SDK → IMP.request_pay() 호출 → 결제창 표시',
        '② 결제 완료 → imp_uid(결제 고유번호) 수신',
        '③ 프론트 → 백엔드 POST /api/payments/verify { imp_uid, merchant_uid, amount }',
        '④ 백엔드: PortOne REST API GET /payments/{imp_uid} 조회 (API 키는 서버 보관)',
        '⑤ 실제 결제 금액 vs 요청 금액 대조 검증 → 일치 시 DB 저장',
        '⑥ payments 테이블: imp_uid, merchant_uid, amount, method, status, paid_at',
      ]} />
      <HelpSection label="현재 구현 상태" items={[
        'Spring Boot 검증 API 및 DB 구조 완성',
        'PortOne SDK 프론트 미연동 — 결제 버튼 UI만 구현됨',
        '실제 연동 시: <script src="https://cdn.iamport.kr/v1/iamport.js"> 추가 필요',
        'IMP.init("가맹점 식별코드") 초기화 후 IMP.request_pay() 호출',
      ]} />
      <HelpSection label="보안 포인트" items={[
        'API 키는 절대 프론트에 노출 금지 — Render 환경변수에만 보관',
        '금액은 반드시 서버에서 재검증 (프론트 전달값 신뢰 불가)',
      ]} />
    </>
  ),
  chat: (
    <>
      <HelpSection label="아키텍처" items={[
        '프론트 → Spring Boot POST /api/chat → Anthropic API → Claude Haiku 4.5',
        'API Key는 백엔드(Render 환경변수)에만 보관 — 클라이언트에 절대 미노출',
        'Spring Boot가 중간 프록시 역할 (rate limit, 로깅, API 키 보호)',
      ]} />
      <HelpSection label="대화 구현 방식" items={[
        '프론트: messages[] 배열(role/content)을 매 요청마다 전부 전송',
        '서버: 전달받은 배열을 그대로 Anthropic messages API에 전달',
        '서버 측 세션 없음 — 대화 기록은 프론트 React 상태에만 존재',
        '탭 닫거나 새로고침 시 대화 초기화 (localStorage 미저장)',
      ]} />
      <HelpSection label="비용 & 한계" items={[
        'Claude Haiku 4.5: 입력 $0.80/MTok · 출력 $4/MTok (Sonnet 대비 약 10배 저렴)',
        '평균 대화 한 번: ~$0.001 미만 (데모 규모)',
        'Prompt Caching 미적용 — 반복 시스템 프롬프트 비용 최적화 여지 있음',
        'Rate limiting 미구현 — 악용 방지 필요 시 Spring Boot 레벨에서 추가 필요',
      ]} />
    </>
  ),
  planner: (
    <>
      <HelpSection label="데모 vs 실제 버전 차이" items={[
        '데모: React useState만 사용 — 서버 요청 없음, 새로고침 시 초기화',
        '실제: Spring Boot JPA — planner_items 테이블(PostgreSQL)에 영속화',
        '실제: 일정별 notify_at 설정 → Quartz Scheduler가 1분마다 체크 → 알림 발송',
      ]} />
      <HelpSection label="음성 입력 (실제 버전)" items={[
        'Web Speech API SpeechRecognition → 음성을 텍스트로 변환',
        '텍스트를 Spring Boot /api/planner/voice로 전송',
        'Spring Boot → Claude Haiku NLP 파싱: "다음 주 월요일 2시 치과"',
        '→ { title: "치과 예약", date: "2026-05-04", time: "14:00" } 구조로 반환',
        '프론트가 파싱 결과로 폼 자동 채움',
      ]} />
      <HelpSection label="알림 스택 (실제 버전)" items={[
        'VAPID Web Push: 브라우저에 push_subscriptions 테이블에 구독 저장',
        'Quartz: notify_at 도달 시 WebPushService.send() 호출',
        'CoolSMS: 선택적 SMS 알림 (COOLSMS_API_KEY 환경변수)',
      ]} />
    </>
  ),
  workout: (
    <>
      <HelpSection label="데모 구현 방식" items={[
        '타이머: useRef<NodeJS.Timeout>으로 setInterval(1000ms) 관리',
        '세트 체크: Record<"운동ID-세트인덱스", boolean> 상태로 추적',
        '운동 타이머 → 완료 시 자동으로 휴식 타이머 시작 (체인 타이머)',
        '진행률: 모든 세트 완료 운동 수 ÷ 전체 운동 수',
        '새로고침 시 초기화 (세션 내 상태만 유지)',
      ]} />
      <HelpSection label="실제 버전 DB 구조" items={[
        'exercises: id, name, total_sets, rest_seconds, duration_seconds, order_index',
        'workout_logs: id, exercise_id, user_id, date, completed_sets',
        'workout_videos: Supabase workout-videos 버킷 업로드 → DB에 URL 저장',
      ]} />
      <HelpSection label="실제 버전 추가 기능" items={[
        'TTS: window.speechSynthesis.speak(new SpeechSynthesisUtterance("3세트 완료"))',
        '운동 통계: 주간·월간 완료율 집계 API (exercises + workout_logs JOIN)',
        '영상: Supabase 버킷 Public URL 스트리밍 (video 태그 src 직접 연결)',
      ]} />
    </>
  ),
  photos: (
    <>
      <HelpSection label="업로드 흐름" items={[
        '① 클라이언트 → Spring Boot POST /api/photos/upload (MultipartFile)',
        '② 백엔드: Supabase Storage REST API PUT 요청 (service-key 인증)',
        '③ Supabase photos 버킷에 저장 → Public URL 생성',
        '④ photos 테이블(PostgreSQL)에 URL, 파일명, 크기, 업로더 저장',
        '⑤ 클라이언트: Public URL을 img src에 직접 사용',
      ]} />
      <HelpSection label="레이아웃 구현" items={[
        'CSS Grid grid-cols-2 sm:grid-cols-3 바둑판 그리드',
        'aspect-square: 셀을 항상 정사각형으로 고정',
        'object-cover: 이미지를 잘라서 셀에 꽉 채움',
        '용량 표시: GET /api/photos/storage → 파일 크기 합산 MB 표시',
        '전체 용량 한도: 1GB (Supabase 무료 플랜)',
      ]} />
      <HelpSection label="권한 & 보안" items={[
        'Supabase 버킷: Public read (다운로드는 누구나 가능)',
        '업로드·삭제: 가족 로그인(JWT) 필요 — 백엔드에서 검증',
        'Service Key는 백엔드에만 보관 (클라이언트 미노출)',
      ]} />
    </>
  ),
  messenger: (
    <>
      <HelpSection label="데모 vs 실제 차이" items={[
        '데모: React state만 — WebSocket 없음, 새로고침 시 더미 메시지로 리셋',
        '실제: STOMP/SockJS로 실시간 양방향 통신, PostgreSQL에 영속화',
      ]} />
      <HelpSection label="WebSocket 연결 방식" items={[
        'SockJS: ws://{API}/ws?token={JWT} — 쿼리파라미터로 인증',
        '이유: 브라우저 WebSocket API는 커스텀 헤더 설정 불가',
        'JwtHandshakeInterceptor: 연결 전 JWT 검증 → 세션 attributes에 email/name 저장',
        'Spring Boot @EnableWebSocketMessageBroker — 인메모리 STOMP 브로커',
        '구독: /topic/messages (메시지), /topic/reads (읽음 상태)',
        '발행: /app/chat.send → 서버 @MessageMapping 핸들러',
      ]} />
      <HelpSection label="읽음 처리 & 뱃지" items={[
        'message_reads 테이블: userEmail(PK), lastReadId — 사용자별 마지막 읽은 메시지 ID',
        '채팅방 입장 시 POST /api/messenger/read → lastReadId 업데이트',
        '미읽음 수: COUNT(id) > lastReadId → 30초 폴링 + 실시간 이벤트로 업데이트',
        'VAPID Web Push: WebPushService가 새 메시지 수신 시 다른 사용자에게 푸시',
        'navigator.setAppBadge(n): iOS 16.4+ PWA 홈 아이콘 뱃지 수 설정',
      ]} />
    </>
  ),
  draft: (
    <>
      <HelpSection label="자동 생성 파이프라인" items={[
        '① GitHub push 발생 → dev-log.yml GitHub Actions 워크플로우 트리거',
        '② 2분 대기 (Docker 빌드·Render 배포 안정화 시간)',
        '③ Spring Boot POST /api/dev-logs/webhook 호출',
        '   X-Webhook-Secret 헤더로 인증 (JWT 아님, 서버간 시크릿)',
        '④ 백엔드: 커밋 목록을 Anthropic Claude Haiku에 전달',
        '   프롬프트: "다음 커밋들을 개발일지 형식으로 한국어 요약해줘"',
        '⑤ 생성된 마크다운 요약을 dev_logs 테이블(PostgreSQL)에 저장',
        '⑥ Slack #dev 채널에 "새 드래프트 생성" 알림 전송',
      ]} />
      <HelpSection label="수동 편집 기능" items={[
        'Toast UI Editor: 마크다운 WYSIWYG 에디터로 AI 요약 직접 수정',
        'PUT /api/dev-logs/{id}: 수정된 내용으로 DB 덮어쓰기',
        'Slack Bot: 수정 완료 시 #dev 채널에 알림',
        'PDF 출력: window.print() + @media print CSS로 PDF 저장',
      ]} />
      <HelpSection label="보안" items={[
        '웹훅 엔드포인트는 X-Webhook-Secret으로 자체 인증 (Spring Security 우회)',
        '개발일지 조회: 전체 공개 (드래프트 카테고리 블로그와 별개)',
        '수정은 JWT 인증 필요 (가족 로그인)',
      ]} />
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
