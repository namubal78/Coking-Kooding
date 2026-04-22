'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { apiFetch } from '@/lib/api'

type Payment = {
  id: number
  impUid: string
  merchantUid: string
  amount: number
  buyerName: string
  status: string
  paidAt: string
}

const STATUS_LABEL: Record<string, string> = {
  paid: '결제완료',
  cancelled: '취소됨',
  failed: '실패',
}

const STATUS_COLOR: Record<string, string> = {
  paid: 'text-green-400 bg-green-900/30',
  cancelled: 'text-red-400 bg-red-900/30',
  failed: 'text-gray-500 bg-gray-800',
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/api/payments').then(r => r.json()).then(setPayments).finally(() => setLoading(false))
  }, [])

  const total = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-1">Payments</p>
            <h1 className="text-3xl font-bold">결제 내역</h1>
          </div>
          {payments.length > 0 && (
            <div className="text-right">
              <p className="text-xs text-gray-600">총 결제액</p>
              <p className="text-xl font-bold text-indigo-400">{total.toLocaleString()}원</p>
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-dashed border-gray-700 rounded-xl p-6 mb-8 text-center">
          <p className="text-gray-600 text-sm mb-3">결제 버튼 영역 (포트원 SDK 연동 필요)</p>
          <button disabled className="bg-gray-800 text-gray-600 px-6 py-3 rounded-lg text-sm font-semibold cursor-not-allowed">
            💳 결제하기 (미연동)
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <p className="text-center py-12 text-gray-600">결제 내역이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {payments.map(p => (
              <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[p.status] ?? STATUS_COLOR.failed}`}>
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                    <span className="text-sm font-semibold text-white">{p.amount.toLocaleString()}원</span>
                  </div>
                  <p className="text-gray-500 text-xs">{p.buyerName} · {p.merchantUid}</p>
                  <p className="text-gray-700 text-xs mt-0.5">{new Date(p.paidAt).toLocaleString('ko-KR')}</p>
                </div>
                <span className="text-xs text-gray-700 shrink-0 hidden sm:block">{p.impUid}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
