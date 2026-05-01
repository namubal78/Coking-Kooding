'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { apiFetch } from '@/lib/api'
import { HelpButton, HelpModal, HelpSection } from '@/components/HelpModal'

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

export default function DemoPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [helpOpen, setHelpOpen] = useState(false)

  useEffect(() => {
    apiFetch('/api/payments').then(r => r.json()).then(setPayments).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const total = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-1">Demo · Payments</p>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">결제 내역</h1>
              <HelpButton onClick={() => setHelpOpen(true)} />
            </div>
          </div>
          {payments.length > 0 && (
            <div className="text-right">
              <p className="text-xs text-gray-600">총 결제액</p>
              <p className="text-xl font-bold text-indigo-400">{total.toLocaleString()}원</p>
            </div>
          )}
        </div>

        <p className="text-gray-500 text-sm mb-6">포트원(PortOne) 결제 연동 데모입니다. 실제 결제는 미연동 상태입니다.</p>

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

      {helpOpen && (
        <HelpModal title="💳 결제 내역 — 구현 방식" onClose={() => setHelpOpen(false)}>
          <HelpSection label="결제 검증 흐름" items={[
            '① 프론트: PortOne JS SDK → IMP.request_pay() 호출 → 결제창 표시',
            '② 결제 완료 → imp_uid(결제 고유번호) 수신',
            '③ 프론트 → 백엔드 POST /api/payments/verify { imp_uid, merchant_uid, amount }',
            '④ 백엔드: PortOne REST API GET /payments/{imp_uid} 조회 (API 키 서버 보관)',
            '⑤ 실제 결제 금액 vs 요청 금액 대조 검증 → 일치 시 DB 저장',
          ]} />
          <HelpSection label="DB 스키마" items={[
            'payments: id, imp_uid, merchant_uid, amount, method, status, paid_at',
            'status: PAID / CANCELLED / FAILED',
          ]} />
          <HelpSection label="현재 구현 상태" items={[
            'Spring Boot 검증 API 및 DB 구조 완성 — 실제로 조회 가능',
            'PortOne SDK 프론트 미연동 — 결제 버튼 UI만 구현됨',
            '연동 시: <script src="iamport.js"> 추가 + IMP.init("가맹점코드")',
            '보안: API 키는 절대 프론트 미노출, 금액은 서버에서 반드시 재검증',
          ]} />
        </HelpModal>
      )}
    </div>
  )
}
