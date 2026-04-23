import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 pt-28 pb-16 space-y-10">

        <section>
          <p className="text-indigo-400 text-xs font-mono tracking-widest mb-2">@namubal78</p>
          <h1 className="text-3xl font-bold mb-4">한영섭</h1>
          <p className="text-gray-400 leading-relaxed">
            {/* 여기에 소개 내용을 추가하세요 */}
          </p>
        </section>

        <section className="flex gap-4">
          <Link href="/portfolio" className="text-sm text-indigo-400 hover:text-indigo-300 border border-indigo-900/50 hover:border-indigo-500/50 px-4 py-2 rounded-lg transition-all">
            포트폴리오 →
          </Link>
          <Link href="/blog" className="text-sm text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 px-4 py-2 rounded-lg transition-all">
            블로그 →
          </Link>
          <a href="https://github.com/namubal78" target="_blank" rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 px-4 py-2 rounded-lg transition-all">
            GitHub →
          </a>
        </section>

      </main>
    </div>
  )
}
