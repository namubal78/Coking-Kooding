import Link from 'next/link'
import Navbar from '@/components/Navbar'

const PROJECTS = [
  {
    title: 'Coking-Cooding',
    desc: '블로그 · 포트폴리오 · 가족 전용 공간을 하나로 통합한 풀스택 사이드 프로젝트. 개발 과정의 트러블슈팅을 블로그에 기록하며 직접 디벨롭 중.',
    tags: ['Next.js', 'Spring Boot', 'PostgreSQL', 'OAuth2', 'Docker', 'GitHub Actions'],
    links: [
      { label: '사이트', href: '/' },
      { label: 'GitHub', href: 'https://github.com/namubal78/Coking-Cooding' },
    ],
    wip: true,
  },
]

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-12">
          <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-1">Portfolio</p>
          <h1 className="text-3xl font-bold">포트폴리오</h1>
          <p className="text-gray-500 text-sm mt-2">실무 경험과 사이드 프로젝트 기록입니다.</p>
        </div>

        <div className="space-y-6">
          {PROJECTS.map((p) => (
            <div key={p.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-indigo-500/30 transition-all">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h2 className="text-xl font-bold text-white">{p.title}</h2>
                {p.wip && (
                  <span className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded-full shrink-0">진행 중</span>
                )}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">{p.desc}</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {p.tags.map(t => (
                  <span key={t} className="text-xs bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full">{t}</span>
                ))}
              </div>
              <div className="flex gap-3">
                {p.links.map(l => (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="text-sm text-indigo-400 hover:text-indigo-300 border border-indigo-900/50 hover:border-indigo-500/50 px-3 py-1.5 rounded-lg transition-all"
                  >
                    {l.label} →
                  </Link>
                ))}
                <Link
                  href="/blog"
                  className="text-sm text-gray-500 hover:text-gray-300 border border-gray-800 hover:border-gray-600 px-3 py-1.5 rounded-lg transition-all"
                >
                  트러블슈팅 기록 →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gray-900/50 border border-dashed border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-600 text-sm">실무 프로젝트 소개 추가 예정</p>
        </div>
      </main>
    </div>
  )
}
