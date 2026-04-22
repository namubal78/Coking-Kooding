import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-white hover:text-indigo-400 transition-colors">
            Coking<span className="text-indigo-400">Cooding</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">블로그</Link>
            <Link href="/portfolio" className="text-sm text-gray-400 hover:text-white transition-colors">포트폴리오</Link>
            <Link href="/login" className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition-colors">
              은새네 로그인
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-16">
        <div className="max-w-2xl w-full text-center space-y-4">
          <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase">Blog · Portfolio · Family</p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Coking<span className="text-indigo-400">Cooding</span>
          </h1>
          <p className="text-gray-400 text-lg">
            배우고 기록하고 만드는 공간
          </p>
        </div>
      </section>

      {/* 3 Sections */}
      <section className="max-w-6xl mx-auto px-6 pb-24 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* 블로그 */}
          <Link href="/blog" className="group bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-indigo-500/40 transition-all duration-200 flex flex-col">
            <div className="text-4xl mb-4">✍️</div>
            <h2 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">블로그</h2>
            <p className="text-gray-500 text-sm leading-relaxed flex-1">
              학습 기록과 트러블슈팅을 남기는 기술 블로그.
              코킹쿠딩 개발 과정을 실시간으로 기록합니다.
            </p>
            <span className="mt-6 text-indigo-400 text-sm group-hover:translate-x-1 transition-transform inline-block">글 보러 가기 →</span>
          </Link>

          {/* 포트폴리오 */}
          <Link href="/portfolio" className="group bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-indigo-500/40 transition-all duration-200 flex flex-col">
            <div className="text-4xl mb-4">🗂️</div>
            <h2 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">포트폴리오</h2>
            <p className="text-gray-500 text-sm leading-relaxed flex-1">
              실무 프로젝트와 사이드 프로젝트 소개.
              구현된 기능을 직접 체험하고 코드를 확인할 수 있습니다.
            </p>
            <span className="mt-6 text-indigo-400 text-sm group-hover:translate-x-1 transition-transform inline-block">프로젝트 보러 가기 →</span>
          </Link>

          {/* 은새월드 */}
          <Link href="/login" className="group bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-indigo-500/40 transition-all duration-200 flex flex-col">
            <div className="text-4xl mb-4">🏠</div>
            <h2 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">은새월드</h2>
            <p className="text-gray-500 text-sm leading-relaxed flex-1">
              가족 전용 공간. 플래너, 파일 관리, 결제 내역 등
              로그인 후 이용할 수 있습니다.
            </p>
            <span className="mt-6 text-indigo-400 text-sm group-hover:translate-x-1 transition-transform inline-block">은새네 로그인 →</span>
          </Link>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-600 text-sm">
        © 2026 CokingCooding · Built with Next.js & Spring Boot
      </footer>
    </div>
  )
}
