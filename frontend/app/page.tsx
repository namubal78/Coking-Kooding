import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link href="/about" className="text-sm font-mono text-gray-400 hover:text-indigo-400 transition-colors">
              namubal78
            </Link>
            <span className="text-gray-700">·</span>
            <Link href="/" className="text-xl font-bold tracking-tight text-white hover:text-indigo-400 transition-colors">
              Coking<span className="text-indigo-400">Cooding</span>
            </Link>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">블로그</Link>
            <Link href="/portfolio" className="text-sm text-gray-400 hover:text-white transition-colors">포트폴리오</Link>
            <Link href="/demo" className="text-sm text-gray-400 hover:text-white transition-colors">데모</Link>
            <Link href="/login" className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition-colors">
              은새네 로그인
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero with main.png */}
      <section className="relative flex-1 flex flex-col items-center justify-center min-h-[70vh] px-6 pt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/main.png"
            alt="CokingCooding"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950/40 to-gray-950" />
        </div>
        <div className="relative z-10 max-w-2xl w-full text-center space-y-5">
          <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase">Blog · Portfolio · Family</p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Coking<span className="text-indigo-400">Cooding</span>
          </h1>
          <p className="text-gray-400 text-lg">배우고 기록하고 만드는 공간</p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/portfolio" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              포트폴리오 보기
            </Link>
            <Link href="/blog" className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              블로그 보기
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Sections */}
      <section className="max-w-6xl mx-auto px-6 pb-24 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

          <Link href="/blog" className="group bg-gray-900 border border-gray-800 rounded-2xl p-7 hover:border-indigo-500/40 transition-all duration-200 flex flex-col">
            <div className="text-3xl mb-3">✍️</div>
            <h2 className="text-lg font-bold mb-2 group-hover:text-indigo-400 transition-colors">블로그</h2>
            <p className="text-gray-500 text-sm leading-relaxed flex-1">학습 기록과 트러블슈팅을 남기는 기술 블로그.</p>
            <span className="mt-5 text-indigo-400 text-sm group-hover:translate-x-1 transition-transform inline-block">글 보러 가기 →</span>
          </Link>

          <Link href="/portfolio" className="group bg-gray-900 border border-gray-800 rounded-2xl p-7 hover:border-indigo-500/40 transition-all duration-200 flex flex-col">
            <div className="text-3xl mb-3">🗂️</div>
            <h2 className="text-lg font-bold mb-2 group-hover:text-indigo-400 transition-colors">포트폴리오</h2>
            <p className="text-gray-500 text-sm leading-relaxed flex-1">실무 · 사이드 프로젝트 소개.</p>
            <span className="mt-5 text-indigo-400 text-sm group-hover:translate-x-1 transition-transform inline-block">프로젝트 보기 →</span>
          </Link>

          <Link href="/demo" className="group bg-gray-900 border border-gray-800 rounded-2xl p-7 hover:border-indigo-500/40 transition-all duration-200 flex flex-col">
            <div className="text-3xl mb-3">🔧</div>
            <h2 className="text-lg font-bold mb-2 group-hover:text-indigo-400 transition-colors">기능 데모</h2>
            <p className="text-gray-500 text-sm leading-relaxed flex-1">파일 관리 · 결제 · AI 챗봇 기능 체험.</p>
            <span className="mt-5 text-indigo-400 text-sm group-hover:translate-x-1 transition-transform inline-block">데모 체험하기 →</span>
          </Link>

          <Link href="/login" className="group bg-gray-900 border border-gray-800 rounded-2xl p-7 hover:border-indigo-500/40 transition-all duration-200 flex flex-col">
            <div className="text-3xl mb-3">🏠</div>
            <h2 className="text-lg font-bold mb-2 group-hover:text-indigo-400 transition-colors">은새월드</h2>
            <p className="text-gray-500 text-sm leading-relaxed flex-1">가족 전용 공간. 플래너, 사진 앨범.</p>
            <span className="mt-5 text-indigo-400 text-sm group-hover:translate-x-1 transition-transform inline-block">은새네 로그인 →</span>
          </Link>

        </div>
      </section>

      <footer className="border-t border-gray-800 py-8 text-center text-gray-600 text-sm">
        © 2026 CokingCooding · Built with Next.js & Spring Boot
      </footer>
    </div>
  )
}
