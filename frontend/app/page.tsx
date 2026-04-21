import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-white hover:text-indigo-400 transition-colors">
            Coking<span className="text-indigo-400">Cooding</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              은새네 로그인
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-16">
        <div className="max-w-4xl w-full text-center space-y-6">
          <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase">All-in-One Platform</p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            업무의 모든 것을<br />
            <span className="text-indigo-400">한 곳에서</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            플래너, 파일 관리, 결제, 블로그까지 — 하나의 플랫폼으로 경험하세요.
          </p>

          {/* main.png — 클릭 시 대시보드로 이동 */}
          <Link href="/dashboard" className="block group mt-8">
            <div className="relative rounded-2xl overflow-hidden border border-gray-800 shadow-2xl shadow-indigo-900/20 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-indigo-500/20">
              <Image
                src="/main.png"
                alt="Coking Cooding 메인"
                width={1200}
                height={675}
                className="w-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 to-transparent flex items-end justify-center pb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="bg-indigo-600 text-white px-6 py-3 rounded-full text-sm font-semibold">
                  시작하기 →
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24 w-full">
        <h2 className="text-center text-2xl font-bold mb-10 text-gray-200">제공 서비스</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-indigo-500/40 hover:bg-gray-900/80 transition-all duration-200 group"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-600 text-sm">
        © 2026 CokingCooding · Built with Next.js & Spring Boot
      </footer>
    </div>
  );
}

const features = [
  {
    icon: "🗓️",
    title: "플래너",
    desc: "일정과 업무를 체계적으로 관리하세요. JWT 기반 인증으로 안전하게 보호됩니다.",
  },
  {
    icon: "📁",
    title: "파일 관리",
    desc: "파일 업로드 및 확장자 제어. 허용되지 않은 파일 형식은 자동으로 차단됩니다.",
  },
  {
    icon: "💳",
    title: "결제",
    desc: "포트원 연동 결제 검증. 안전하고 신뢰할 수 있는 결제 시스템을 제공합니다.",
  },
  {
    icon: "✍️",
    title: "블로그",
    desc: "게시글 작성, 수정, 삭제. 인증된 사용자만 콘텐츠를 관리할 수 있습니다.",
  },
];
