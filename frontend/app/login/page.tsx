'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function LoginPage() {
  const [expanded, setExpanded] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const error = params.get('error')
    if (error === 'unauthorized') setErrorMsg('접근 권한이 없습니다.')
    else if (error === 'oauth_failed') setErrorMsg('로그인 중 오류가 발생했습니다.')
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8 text-center">

        <div className="space-y-2">
          <div className="text-5xl">🏠</div>
          <h1 className="text-2xl font-bold">
            Coking<span className="text-indigo-400">Cooding</span>
          </h1>
          <p className="text-gray-500 text-sm">가족 전용 공간입니다</p>
        </div>

        {errorMsg && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-xl px-4 py-3">
            {errorMsg}
          </div>
        )}

        {!expanded ? (
          <button
            onClick={() => setExpanded(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-semibold transition-colors"
          >
            🔐 은새네 로그인
          </button>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => { window.location.href = `${API_URL}/oauth2/authorization/google` }}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              <GoogleIcon />
              Google로 로그인
            </button>
            <button
              onClick={() => { window.location.href = `${API_URL}/oauth2/authorization/kakao` }}
              className="w-full flex items-center justify-center gap-3 bg-yellow-400 text-gray-900 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition-colors"
            >
              <KakaoIcon />
              카카오로 로그인
            </button>
            <button
              onClick={() => setExpanded(false)}
              className="text-sm text-gray-600 hover:text-gray-400 transition-colors"
            >
              취소
            </button>
          </div>
        )}

        <Link href="/" className="block text-xs text-gray-700 hover:text-gray-500 transition-colors">
          ← 홈으로
        </Link>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}

function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#3C1E1E" d="M9 0C4.029 0 0 3.134 0 7c0 2.496 1.561 4.687 3.916 5.958L2.98 17.04a.333.333 0 0 0 .511.368L8.47 14.06A10.84 10.84 0 0 0 9 14.1c4.971 0 9-3.134 9-7S13.971 0 9 0z"/>
    </svg>
  )
}
