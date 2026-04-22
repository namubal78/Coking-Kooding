import Link from 'next/link'
import Navbar from '@/components/Navbar'

const SKILLS = [
  { category: 'Backend', items: ['Java', 'Spring Boot', 'Spring Security', 'JPA', 'JWT', 'OAuth2', 'REST API'] },
  { category: 'Frontend', items: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'] },
  { category: 'Database', items: ['PostgreSQL', 'Supabase', 'HikariCP'] },
  { category: 'DevOps', items: ['Docker', 'GitHub Actions', 'Render', 'GitHub Pages', 'CI/CD'] },
  { category: 'AI / API', items: ['Anthropic Claude API', 'REST Client', 'Webhook'] },
]

const PROJECTS = [
  {
    title: 'Coking-Cooding',
    period: '2026.04 — 진행 중',
    desc: '블로그·포트폴리오·가족 전용 공간(은새월드)을 하나의 서비스로 운영하는 풀스택 개인 프로젝트. 개발 과정의 트러블슈팅을 직접 기록하며 디벨롭 중.',
    points: [
      'Google·Kakao OAuth2 로그인 + JWT 인증, 이메일 화이트리스트 기반 가족 전용 접근 제어',
      'Supabase Storage Private 버킷 + Signed URL로 가족 사진 앨범 구현',
      'Claude Haiku API 프록시 챗봇 (Spring Boot → Anthropic API)',
      'GitHub Actions 커밋마다 Claude가 개발 일지 자동 생성 (dev_logs DB upsert)',
      'Render 배포 반복 실패 원인 추적: ddl-auto, lazy-init, HikariCP, CORS 프리플라이트 등 다수 트러블슈팅 해결',
      'Docker 레이어 캐시 분리로 빌드 시간 단축, Render Starter 플랜으로 상시 가동',
    ],
    tags: ['Spring Boot', 'Next.js', 'PostgreSQL', 'OAuth2', 'Docker', 'GitHub Actions', 'Supabase', 'Claude API'],
    links: [
      { label: '사이트', href: '/' },
      { label: 'GitHub', href: 'https://github.com/namubal78/Coking-Cooding' },
      { label: '개발 일지', href: '/world/draft' },
    ],
    wip: true,
  },
]

const TROUBLES = [
  {
    title: 'Render 배포 포트 스캔 타임아웃',
    desc: 'ddl-auto: update 설정으로 Hibernate가 DB 스키마 동기화 시도 중 290초 타임아웃 발생. ddl-auto: none으로 변경해 해결.',
    tags: ['Spring Boot', 'Hibernate', 'Render'],
  },
  {
    title: 'Spring Security + lazy-init 충돌',
    desc: 'lazy-initialization: true 환경에서 MvcRequestMatcher가 컨트롤러를 인식 못해 permitAll 설정이 무시됨. lazy-init 비활성화로 해결.',
    tags: ['Spring Security', 'MvcRequestMatcher'],
  },
  {
    title: 'HikariCP Pool 고갈 (Render 슬립 후)',
    desc: 'Render 무료 플랜 슬립 후 기존 DB 연결 전부 죽어 JwtFilter에서 401 발생. max-lifetime, keepalive 설정 + Starter 플랜 업그레이드로 해결.',
    tags: ['HikariCP', 'PostgreSQL', 'Render'],
  },
  {
    title: 'CORS 프리플라이트 차단',
    desc: 'OPTIONS 요청이 Spring Security에서 로그인 리다이렉트로 처리됨. HttpMethod.OPTIONS /** permitAll 추가로 해결.',
    tags: ['Spring Security', 'CORS', 'OAuth2'],
  },
  {
    title: 'Supabase Private 버킷 Signed URL',
    desc: 'Public 버킷은 누구나 접근 가능. Private 버킷 + Signed URL(1시간 만료)로 변경해 사진 앨범 보안 강화.',
    tags: ['Supabase Storage', 'Signed URL'],
  },
]

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 pt-28 pb-16 space-y-16">

        {/* Header */}
        <section>
          <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-1">Portfolio</p>
          <h1 className="text-3xl font-bold mb-3">한영섭</h1>
          <p className="text-gray-400 leading-relaxed max-w-2xl">
            Spring Boot와 Next.js를 주력으로 사용하는 백엔드 중심 풀스택 개발자입니다.
            실동작하는 서비스를 직접 설계·구현·배포하며, 트러블슈팅 과정을 기록으로 남기는 것을 중요하게 생각합니다.
          </p>
        </section>

        {/* Skills */}
        <section>
          <h2 className="text-lg font-bold mb-4 text-gray-200">기술 스택</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SKILLS.map(s => (
              <div key={s.category} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-2">{s.category}</p>
                <div className="flex flex-wrap gap-2">
                  {s.items.map(item => (
                    <span key={item} className="text-xs bg-gray-800 text-gray-300 px-2.5 py-1 rounded-full">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section>
          <h2 className="text-lg font-bold mb-4 text-gray-200">프로젝트</h2>
          <div className="space-y-6">
            {PROJECTS.map(p => (
              <div key={p.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-indigo-500/30 transition-all">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <h3 className="text-xl font-bold">{p.title}</h3>
                  {p.wip && <span className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded-full shrink-0">진행 중</span>}
                </div>
                <p className="text-xs text-gray-500 mb-3">{p.period}</p>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{p.desc}</p>
                <ul className="space-y-1.5 mb-5">
                  {p.points.map((pt, i) => (
                    <li key={i} className="text-sm text-gray-400 flex gap-2">
                      <span className="text-indigo-500 shrink-0">·</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 mb-5">
                  {p.tags.map(t => (
                    <span key={t} className="text-xs bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full">{t}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  {p.links.map(l => (
                    <Link key={l.label} href={l.href}
                      className="text-sm text-indigo-400 hover:text-indigo-300 border border-indigo-900/50 hover:border-indigo-500/50 px-3 py-1.5 rounded-lg transition-all">
                      {l.label} →
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Troubleshooting */}
        <section>
          <h2 className="text-lg font-bold mb-1 text-gray-200">트러블슈팅 기록</h2>
          <p className="text-gray-500 text-sm mb-4">개발 과정에서 만난 문제와 해결 과정.</p>
          <div className="space-y-3">
            {TROUBLES.map(t => (
              <div key={t.title} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
                <p className="text-sm font-semibold text-white mb-1">{t.title}</p>
                <p className="text-sm text-gray-400 mb-2">{t.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {t.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/blog" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              블로그에서 전체 기록 보기 →
            </Link>
          </div>
        </section>

      </main>
    </div>
  )
}
