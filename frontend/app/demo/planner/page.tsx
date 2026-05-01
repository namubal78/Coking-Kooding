'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { HelpButton, HelpModal, HelpSection } from '@/components/HelpModal'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const EVENT_COLORS = [
  'bg-indigo-500', 'bg-violet-500', 'bg-sky-500',
  'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
]

const DUMMY_EVENTS = [
  { id: 1, title: '가족 저녁 식사', date: '2026-04-28', description: '삼겹살 구워먹기' },
  { id: 2, title: '은새 피아노 수업', date: '2026-04-29', description: '4시 ~ 5시' },
  { id: 3, title: '건강검진', date: '2026-04-30', description: '아침 공복 필수' },
  { id: 4, title: '프로젝트 배포', date: '2026-05-05', description: 'CokingCooding v1' },
  { id: 5, title: '가족 나들이', date: '2026-05-10', description: '어린이대공원' },
  { id: 6, title: '은새 생일', date: '2026-05-15', description: '케이크 예약 필요' },
]

export default function DemoPlannerPage() {
  const [items, setItems] = useState(DUMMY_EVENTS)
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [form, setForm] = useState({ title: '', description: '', date: '' })
  const [nextId, setNextId] = useState(100)
  const [helpOpen, setHelpOpen] = useState(false)

  const firstDay = new Date(cursor.year, cursor.month, 1).getDay()
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  )

  function padDate(d: number) {
    return `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  function prevMonth() {
    setCursor(c => {
      const d = new Date(c.year, c.month - 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  function nextMonth() {
    setCursor(c => {
      const d = new Date(c.year, c.month + 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  function addItem(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.date) return
    setItems(prev => [...prev, { id: nextId, ...form }])
    setNextId(n => n + 1)
    setForm({ title: '', description: '', date: '' })
  }

  const monthPrefix = `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}`
  const monthItems = items.filter(i => i.date.startsWith(monthPrefix))

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-1">Demo · Planner</p>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-3xl font-bold">플래너</h1>
          <HelpButton onClick={() => setHelpOpen(true)} />
        </div>
        <p className="text-gray-500 text-sm mb-6">더미 데이터로 체험하는 월간 플래너. 추가/삭제는 새로고침 시 초기화됩니다.</p>

        <div className="flex items-center gap-4 mb-4">
          <button onClick={prevMonth} className="text-gray-400 hover:text-white px-3 py-1 rounded-lg transition-colors cursor-pointer text-lg">
            ‹
          </button>
          <span className="font-semibold text-white w-24 text-center">{cursor.year}년 {cursor.month + 1}월</span>
          <button onClick={nextMonth} className="text-gray-400 hover:text-white px-3 py-1 rounded-lg transition-colors cursor-pointer text-lg">
            ›
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-6">
          <div className="grid grid-cols-7 border-b border-gray-800">
            {WEEKDAYS.map(d => (
              <div key={d} className={`text-center text-xs py-2 font-medium ${d === '일' ? 'text-red-400' : d === '토' ? 'text-blue-400' : 'text-gray-600'}`}>
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} className="h-20 border-t border-gray-800/40" />
              const dateStr = padDate(day)
              const dayItems = items.filter(it => it.date === dateStr)
              const today = new Date().toISOString().slice(0, 10)
              const isToday = dateStr === today
              return (
                <div key={dateStr} className="h-20 border-t border-gray-800/40 p-1.5 overflow-hidden">
                  <span className={`text-xs font-medium inline-flex w-5 h-5 rounded-full items-center justify-center mb-0.5 ${
                    isToday ? 'bg-indigo-500 text-white' : 'text-gray-500'
                  }`}>
                    {day}
                  </span>
                  <div className="space-y-0.5">
                    {dayItems.slice(0, 2).map(it => (
                      <div key={it.id} className={`text-[10px] px-1 rounded truncate text-white ${EVENT_COLORS[it.id % EVENT_COLORS.length]}`}>
                        {it.title}
                      </div>
                    ))}
                    {dayItems.length > 2 && (
                      <div className="text-[10px] text-gray-600">+{dayItems.length - 2}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={addItem} className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-400">일정 추가</h2>
            <input
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="제목"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="메모 (선택)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              추가
            </button>
          </form>

          <div>
            <h2 className="text-sm font-semibold text-gray-400 mb-3">이번 달 일정</h2>
            {monthItems.length === 0 ? (
              <p className="text-gray-700 text-sm py-8 text-center">이번 달 일정이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {[...monthItems].sort((a, b) => a.date.localeCompare(b.date)).map(it => (
                  <div key={it.id} className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm text-white font-medium">{it.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {it.date}{it.description && ` · ${it.description}`}
                      </p>
                    </div>
                    <button
                      onClick={() => setItems(prev => prev.filter(i => i.id !== it.id))}
                      className="text-gray-700 hover:text-red-400 text-xs transition-colors cursor-pointer shrink-0"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {helpOpen && (
        <HelpModal title="🗓️ 플래너 — 구현 방식" onClose={() => setHelpOpen(false)}>
          <HelpSection label="데모 vs 실제 버전" items={[
            '데모: React useState만 — 서버 요청 없음, 새로고침 시 초기화',
            '실제: Spring Boot JPA → planner_items 테이블(PostgreSQL)에 영속화',
            '실제: 일정별 notify_at 설정 → Quartz Scheduler가 1분마다 체크',
          ]} />
          <HelpSection label="음성 입력 구현 (실제)" items={[
            'Web Speech API SpeechRecognition → 음성 텍스트 변환',
            '텍스트를 Spring Boot POST /api/planner/voice로 전송',
            'Claude Haiku NLP: "다음 주 월요일 2시 치과"',
            '→ { title: "치과 예약", date: "2026-05-04", time: "14:00" } 반환',
            '파싱 결과로 폼 자동 채움',
          ]} />
          <HelpSection label="알림 스택 (실제)" items={[
            'VAPID Web Push: push_subscriptions 테이블에 구독 정보 저장',
            'Quartz Scheduler: notify_at 도달 시 WebPushService.send() 호출',
            'CoolSMS: 선택적 SMS 알림 (환경변수 설정 시 활성화)',
          ]} />
        </HelpModal>
      )}
    </div>
  )
}
