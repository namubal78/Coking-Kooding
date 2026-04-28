import Link from 'next/link'
import Navbar from '@/components/Navbar'

const DEMOS = [
  {
    href: '/demo/files',
    icon: '📁',
    title: '파일 관리',
    desc: '파일 업로드, 다운로드, 확장자 차단 등 파일 관리 기능 데모.',
    tag: 'Spring Boot + JPA',
  },
  {
    href: '/demo/payments',
    icon: '💳',
    title: '결제 내역',
    desc: '포트원(아임포트) 연동 결제 처리 및 내역 조회 데모.',
    tag: 'PortOne API',
  },
  {
    href: '/demo/chat',
    icon: '🤖',
    title: 'AI 챗봇',
    desc: 'Spring Boot 프록시를 통한 Claude AI 챗봇 데모.',
    tag: 'Claude API',
  },
  {
    href: '/demo/planner',
    icon: '🗓️',
    title: '플래너',
    desc: '월간 캘린더 기반 일정 관리. 더미 데이터로 자유롭게 체험.',
    tag: 'React + useState',
  },
  {
    href: '/demo/workout',
    icon: '💪',
    title: '운동 트래커',
    desc: '세트 체크, 타이머, 진행률 추적. 새로고침 전까지 상태 유지.',
    tag: 'Stopwatch + Checklist',
  },
  {
    href: '/demo/photos',
    icon: '📸',
    title: '사진 앨범',
    desc: '가족 앨범 바둑판 그리드 UI. 더미 앨범으로 레이아웃 체험.',
    tag: 'Grid Layout',
  },
  {
    href: '/demo/messenger',
    icon: '💬',
    title: '가족 메신저',
    desc: '카카오톡 스타일 채팅 UI. 메시지 입력은 로컬 상태로만 동작.',
    tag: 'STOMP / WebSocket UI',
  },
]

export default function DemoPage() {
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
            <Link
              key={d.href}
              href={d.href}
              className="group bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-indigo-500/40 hover:bg-gray-900/80 transition-all duration-200 flex flex-col"
            >
              <div className="text-3xl mb-3">{d.icon}</div>
              <h2 className="font-semibold text-white mb-1 group-hover:text-indigo-400 transition-colors">{d.title}</h2>
              <p className="text-gray-500 text-sm flex-1">{d.desc}</p>
              <span className="mt-4 text-xs text-indigo-500/70 font-mono">{d.tag}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
