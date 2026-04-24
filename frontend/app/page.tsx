'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function Landing() {
  const router = useRouter()

  return (
    <div
      className="min-h-screen bg-gray-950 flex flex-col items-center justify-center cursor-pointer select-none"
      onClick={() => router.push('/home')}
    >
      <div className="relative w-full max-w-2xl px-6">
        <Image
          src="/main.png"
          alt="CokingCooding"
          width={1200}
          height={800}
          className="w-full h-auto rounded-2xl shadow-2xl"
          priority
        />
      </div>
      <p className="mt-6 text-gray-600 text-sm tracking-widest animate-pulse">click to enter</p>
    </div>
  )
}
