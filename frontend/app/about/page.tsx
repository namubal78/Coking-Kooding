import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 pt-28 pb-20 space-y-14">

        {/* 헤더 */}
        <section>
          <p className="text-indigo-400 text-xs font-mono tracking-widest mb-3">@namubal78</p>
          <h1 className="text-4xl font-bold mb-1">한영섭</h1>
          <p className="text-gray-500 text-sm font-mono mb-6">Han Youngseop · 4년 차 웹 개발자</p>
          <p className="text-gray-300 leading-relaxed text-base">
            기술로 서비스의 쾌적함을 설계하는 개발자입니다.
          </p>
          <p className="text-gray-500 leading-relaxed text-sm mt-3">
            공공기관 시스템을 담당하며 잠재적 문제점과 개선 방안을 먼저 제안했습니다. 대내외 관계자들과
            적극적으로 소통하여 병목을 사전에 방지하고, 불연속적인 수주 구조의 SI 사업을 3년 연속
            수주·수행한 경험이 있습니다.
          </p>
          <p className="text-gray-500 leading-relaxed text-sm mt-3">
            화려한 기술적 성취보다는 시스템을 이용하는{' '}
            <span className="text-indigo-400 font-medium">'사용자가 느끼는 쾌적함'</span>이라는
            가치를 지향합니다.
          </p>
        </section>

        {/* 링크 */}
        <section className="flex gap-3 flex-wrap">
          <Link href="/portfolio"
            className="text-sm text-indigo-400 hover:text-indigo-300 border border-indigo-900/50 hover:border-indigo-500/50 px-4 py-2 rounded-lg transition-all">
            포트폴리오 →
          </Link>
          <Link href="/blog"
            className="text-sm text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 px-4 py-2 rounded-lg transition-all">
            블로그 →
          </Link>
          <a href="https://github.com/namubal78" target="_blank" rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 px-4 py-2 rounded-lg transition-all">
            GitHub →
          </a>
          <a href="mailto:namubal78@gmail.com"
            className="text-sm text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 px-4 py-2 rounded-lg transition-all">
            namubal78@gmail.com →
          </a>
        </section>

        {/* 핵심 역량 */}
        <section>
          <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-4">핵심 역량</h2>
          <div className="space-y-3">
            {[
              {
                label: '커뮤니케이션',
                desc: '다각화된 이해 관계자들의 요구를 정확하게 분석하고 전달합니다.',
              },
              {
                label: '도메인 적응력',
                desc: '개발 외 은행, 호텔, 러시아어 전공까지 다양한 도메인에 적응해왔고, 새로운 분야 학습 및 수행에 강점이 있습니다.',
              },
              {
                label: '체계화',
                desc: '혼재된 방식을 구조화하거나, 기존 방식을 새롭게 재설계하여 문제 상황을 해결한 경험이 있습니다.',
              },
            ].map(item => (
              <div key={item.label} className="flex gap-4 py-3 border-b border-gray-800/60 last:border-0">
                <span className="text-indigo-400 text-sm font-medium w-28 shrink-0 pt-0.5">{item.label}</span>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 경력 */}
        <section>
          <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-5">Work Experience</h2>
          <div className="space-y-6">

            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="text-white font-semibold text-sm">(주)지에이시스템</p>
                  <p className="text-gray-500 text-xs mt-0.5">SI 1팀 · 대리</p>
                </div>
                <span className="text-indigo-400 text-xs font-mono shrink-0">2023.03 — 2026.03</span>
              </div>
              <ul className="space-y-1.5 pl-3 border-l border-gray-800">
                <li className="text-gray-400 text-sm">외부 SI 사업 수주 및 수행</li>
                <li className="text-gray-500 text-xs pl-2">법령 기반 분석 및 인터뷰를 통해 목표 시스템 개념도 작성 (2026)</li>
                <li className="text-gray-500 text-xs pl-2">사전 체험 가능한 화면 프로토타입 제작하여 피드백 수집 (2026)</li>
                <li className="text-gray-400 text-sm mt-1">내부 SOL/SER 사업 운영 지원</li>
                <li className="text-gray-500 text-xs pl-2">자사 서비스 테스트 및 운영 지원 (2023–2026)</li>
              </ul>
            </div>

            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="text-white font-semibold text-sm">KB 국민은행
                    <span className="ml-2 text-[10px] font-normal text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">비개발</span>
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">리브모바일플랫폼단 · 주임</p>
                </div>
                <span className="text-indigo-400 text-xs font-mono shrink-0">2021.11 — 2022.03</span>
              </div>
              <ul className="space-y-1 pl-3 border-l border-gray-800">
                <li className="text-gray-400 text-sm">계약직 리브매니저로 모바일 상품 판매 및 판매 지원 담당</li>
              </ul>
            </div>

            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="text-white font-semibold text-sm">KB 국민은행
                    <span className="ml-2 text-[10px] font-normal text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">비개발</span>
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">화곡동 지점 · 대리</p>
                </div>
                <span className="text-indigo-400 text-xs font-mono shrink-0">2018.12 — 2019.03</span>
              </div>
              <ul className="space-y-1 pl-3 border-l border-gray-800">
                <li className="text-gray-400 text-sm">일반행원(UB)으로 기업 금융 보조 업무 수행 (AO)</li>
              </ul>
            </div>

          </div>
        </section>

        {/* 회사 프로젝트 */}
        <section>
          <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-5">Professional Projects</h2>
          <div className="space-y-3">
            {[
              {
                title: '온라인 임치시스템 기능개선',
                org: '한국저작권위원회',
                period: '2023.06 — 2025.10',
                stack: ['Java/Spring', 'CUBRID'],
                role: '레거시 아키텍처 재설계·쿼리 최적화·반응형 UI 도입으로 공공 시스템 성능 및 안정성 개선',
                featured: true,
              },
              {
                title: '규제자유특구 정보시스템 유지관리 용역',
                org: '중소벤처기업부',
                period: '2026.01 — 2026.03',
                stack: ['Java/Spring', 'PostgreSQL'],
                role: '인터뷰·벤치마킹 기반 목표 시스템 개념도·프로토타입 설계 (기획/설계 PL)',
                featured: false,
              },
              {
                title: '과학문화 확산을 위한 플랫폼 기획 및 운영지원 용역',
                org: '한국과학창의재단',
                period: '2025.04 — 2025.09',
                stack: ['Java/Spring', 'PostgreSQL', 'HTML/JS'],
                role: '특집 페이지 HTML 인터랙티브 컨텐츠 구현·퀴즈 이벤트·만족도 조사 기획 및 운영',
                featured: false,
              },
              {
                title: '전자의무기록시스템 인증포털 유지관리',
                org: '한국보건의료정보원',
                period: '2024.06 — 2024.08',
                stack: ['Java/Spring', 'PostgreSQL'],
                role: '설문 로직 통합·통계 시각화·암호화 참여 링크 구현으로 관리 효율성 개선',
                featured: false,
              },
            ].map(p => (
              <div key={p.title} className={`bg-gray-900 border rounded-xl px-5 py-4 ${p.featured ? 'border-indigo-800/50' : 'border-gray-800'}`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {p.featured && (
                        <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-full">대표 프로젝트</span>
                      )}
                      <p className="text-white text-sm font-medium">{p.title}</p>
                    </div>
                    <p className="text-gray-600 text-xs mt-0.5">{p.org}</p>
                  </div>
                  <span className="text-gray-600 text-xs font-mono shrink-0">{p.period}</span>
                </div>
                <p className="text-gray-500 text-xs mb-2">{p.role}</p>
                <div className="flex gap-1.5 flex-wrap">
                  {p.stack.map(s => (
                    <span key={s} className="text-[10px] text-gray-600 bg-gray-800/60 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 사이드 프로젝트 */}
        <section>
          <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-5">Side Projects</h2>
          <div className="space-y-3">
            <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">개인</span>
                    <Link href="/home" className="text-white text-sm font-medium hover:text-indigo-400 transition-colors">
                      CokingCooding →
                    </Link>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">풀스택 개인 프로젝트 — 블로그·플래너·가족 메신저·AI 일지 자동화</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 학력 & 기타 */}
        <section>
          <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-5">Education & More</h2>
          <div className="space-y-3">
            {[
              { label: 'KH정보교육원', sub: '웹개발 교육 수료', period: '2022.07 — 2022.12' },
              { label: '연세대학교', sub: '노어노문학과 졸업', period: '2009.03 — 2019.02' },
              { label: '상산고등학교', sub: '졸업', period: '2005.03 — 2008.02' },
            ].map(e => (
              <div key={e.label} className="flex items-center justify-between py-2.5 border-b border-gray-800/60 last:border-0">
                <div>
                  <p className="text-white text-sm font-medium">{e.label}</p>
                  <p className="text-gray-600 text-xs mt-0.5">{e.sub}</p>
                </div>
                <span className="text-gray-600 text-xs font-mono">{e.period}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3 flex-wrap">
            <span className="text-xs text-gray-600 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg">
              TOEIC 850점 (2026.03.29)
            </span>
            <span className="text-xs text-gray-600 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg">
              KH Final 팀프로젝트 1등 (2022)
            </span>
            <span className="text-xs text-gray-600 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg">
              이랜드 전략기획 인턴십 (2018)
            </span>
            <span className="text-xs text-gray-600 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg">
              태권도 2단
            </span>
          </div>
        </section>

      </main>
    </div>
  )
}
