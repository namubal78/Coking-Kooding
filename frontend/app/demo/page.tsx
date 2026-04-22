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
]

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-10">
          <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-2">Demo</p>
          <h1 className="text-3xl font-bold">기능 데모</h1>
          <p className="text-gray-500 text-sm mt-2">코킹쿠딩에서 구현한 기능들을 직접 체험해보세요.</p>
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
