import Link from 'next/link'
import Navbar from '@/components/Navbar'

const SKILLS = [
  { category: 'Backend', items: ['Java', 'Spring Boot 3', 'Spring Security', 'JPA', 'JWT', 'OAuth2', 'REST API', 'ExecutorService'] },
  { category: 'Frontend', items: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'jQuery', 'JSP'] },
  { category: 'Database', items: ['PostgreSQL', 'CUBRID', 'HikariCP', 'Supabase'] },
  { category: 'DevOps', items: ['Docker', 'GitHub Actions', 'Render', 'GitHub Pages', 'SVN'] },
  { category: 'AI / API', items: ['Anthropic Claude API', 'PortOne 결제 API', 'Webhook'] },
]

const PROJECTS = [
  {
    title: '온라인 임치시스템 기능개선',
    company: '지에이시스템',
    period: '2023.06 — 2025.10 (3년 연속 수주)',
    stack: ['Java 1.7', 'Spring 3.2.9', 'CUBRID', 'JSP', 'jQuery', 'SVN'],
    team: '3명',
    service: '한국저작권위원회 온라인 임치시스템 기능개선 및 유지보수',
    achievements: [
      {
        title: 'ExecutorService 활용 이기종 DB lock-timeout 전파 차단',
        problem: 'SMS 발송 로직이 계약 메인 트랜잭션 안에서 외부 이기종 DB에 쿼리를 날리는 구조. lock_timeout 발생 시 외부 장애가 메인 TX 전체를 블로킹하고 rollback까지 전파.',
        solve: 'SMS 발송 로직을 ExecutorService 익명 내부 클래스로 새 스레드에 위임해 ThreadLocal 전파 범위에서 제외. Future.get 타임아웃 3초 초과 시 강제 종료.',
        result: '발송 실패로 인한 롤백 이슈 해결 및 계약 처리 흐름 영향 제거',
      },
      {
        title: '계약 조회 필드 단위 바인딩 + 전자서명 순서 보장',
        problem: '계약서 수정 시 DB 직접 UPDATE 필요, 수정 이력 추적 불가. 전자서명 솔루션 내부 처리 지연 시 동일 레코드 동시 UPDATE 경합으로 DB 무한 대기.',
        solve: '20~30종 계약 유형을 통합 레이아웃 JSP로 전환해 세부 필드값을 직접 바인딩. 전자서명 처리 함수를 Promise로 래핑하고 async/await으로 완료 후 서버 전송 순서 강제.',
        result: '조회 데이터 크기 평균 12KB → 238bytes (97% 감소). 관리자 직접 수정 가능, 전자서명 중복 요청 구조적 차단',
      },
      {
        title: 'FileChannel 재전송으로 업로드 파일 무결성 확보',
        problem: '클라우드 전환 후 파일이 손상되어 업로드되는 현상 발생. S3FS 환경과 업로드 솔루션의 파일 쓰기 방식 충돌.',
        solve: '우회 경로에 먼저 업로드 후 AJAX 순서 보장하여 재업로드 호출. 서버 단에서 FileChannel로 순차 재전송 후 renameTo()로 최종 경로 이동 (동기 방식 — 법적 효력 있는 원본 파일 무결성 우선).',
        result: 'OS-솔루션 충돌로 인한 파일 손상 이슈 해결, 정상 파일 타입으로 업로드',
      },
    ],
    wip: false,
  },
  {
    title: 'Coking-Cooding',
    company: '개인 사이드 프로젝트',
    period: '2026.04 — 진행 중',
    stack: ['Spring Boot 3.4', 'Next.js 15', 'PostgreSQL', 'OAuth2', 'Docker', 'GitHub Actions', 'Supabase', 'Claude API'],
    team: '1명',
    service: '블로그·포트폴리오·가족 전용 공간을 하나의 서비스로 운영하는 풀스택 웹 애플리케이션',
    achievements: [
      {
        title: 'Render 배포 반복 실패 원인 추적 및 해결',
        problem: 'ddl-auto: update → Hibernate 스키마 동기화 중 DB 타임아웃 → 290초 포트 스캔 타임아웃으로 배포 실패 반복.',
        solve: 'ddl-auto: none으로 변경. lazy-init + MvcRequestMatcher 충돌 해결. HikariCP keepalive 설정.',
        result: '배포 성공, Render Starter 상시 가동',
      },
      {
        title: 'AI 기반 자동 개발 일지 시스템',
        problem: '커밋마다 개발 내용을 수동으로 기록하는 번거로움.',
        solve: 'GitHub Actions → 배포 완료 대기 → 백엔드 웹훅 → Claude Haiku API 요약 생성 → dev_logs 테이블 upsert.',
        result: '커밋마다 기술 개념 설명 포함 개발 일지 자동 생성',
      },
    ],
    wip: true,
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
            Spring Boot와 Java를 주력으로 실무 경험을 쌓아온 백엔드 중심 개발자입니다.
            외부 시스템 장애 차단, 데이터 무결성 확보, 성능 최적화 등 근본 원인을 파악하고
            구조적으로 해결하는 것을 중요하게 생각합니다.
          </p>
        </section>

        {/* Proficiency */}
        <section>
          <h2 className="text-lg font-bold mb-3 text-gray-200">핵심 역량</h2>
          <div className="space-y-2">
            {[
              'ExecutorService와 타임아웃 설정을 활용하여 외부 시스템 장애가 메인 트랜잭션으로 전파되는 것을 차단하고 시스템 안정성을 확보',
              '주문번호 기반 멱등성 검증 및 DB 제약 조건을 활용하여 결제 등 민감한 데이터의 중복 요청을 방지하고 정합성 유지',
              'Promise와 async/await을 활용한 비동기 제어와 필드 단위 바인딩을 통해 데이터 전송 효율 최적화 및 순차 로직 보장',
            ].map((item, i) => (
              <div key={i} className="flex gap-3 text-sm text-gray-400">
                <span className="text-indigo-500 shrink-0 mt-0.5">·</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section>
          <h2 className="text-lg font-bold mb-4 text-gray-200">기술 스택</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SKILLS.map(s => (
              <div key={s.category} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-2">{s.category}</p>
                <div className="flex flex-wrap gap-1.5">
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
          <div className="space-y-8">
            {PROJECTS.map(p => (
              <div key={p.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <div>
                    <h3 className="text-xl font-bold">{p.title}</h3>
                    <p className="text-indigo-400 text-sm mt-0.5">{p.company}</p>
                  </div>
                  {p.wip && <span className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded-full shrink-0">진행 중</span>}
                </div>
                <p className="text-xs text-gray-500 mb-1">{p.period} · {p.team}</p>
                <p className="text-sm text-gray-400 mb-4">{p.service}</p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {p.stack.map(t => (
                    <span key={t} className="text-xs bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full">{t}</span>
                  ))}
                </div>
                <div className="space-y-4">
                  {p.achievements.map((a, i) => (
                    <div key={i} className="border-l-2 border-gray-700 pl-4">
                      <p className="text-sm font-semibold text-white mb-1">{a.title}</p>
                      <p className="text-xs text-gray-500 mb-1"><span className="text-gray-600 font-medium">문제 · </span>{a.problem}</p>
                      <p className="text-xs text-gray-500 mb-1"><span className="text-gray-600 font-medium">해결 · </span>{a.solve}</p>
                      <p className="text-xs text-indigo-400"><span className="font-medium">결과 · </span>{a.result}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="pt-2">
          <Link href="/blog" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            트러블슈팅 블로그 기록 보기 →
          </Link>
        </div>

      </main>
    </div>
  )
}
