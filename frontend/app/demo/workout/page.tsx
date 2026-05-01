'use client'

import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import { HelpButton, HelpModal, HelpSection } from '@/components/HelpModal'

const DUMMY_EXERCISES = [
  { id: 1, name: '스쿼트', sets: 3, reps: 15, weight: 0, unit: 'kg' },
  { id: 2, name: '벤치프레스', sets: 4, reps: 10, weight: 60, unit: 'kg' },
  { id: 3, name: '데드리프트', sets: 3, reps: 8, weight: 80, unit: 'kg' },
  { id: 4, name: '풀업', sets: 3, reps: 8, weight: 0, unit: 'kg' },
  { id: 5, name: '플랭크', sets: 3, reps: 60, weight: 0, unit: 'sec' },
]

export default function DemoWorkoutPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [timerSec, setTimerSec] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => setTimerSec(s => s + 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [timerRunning])

  function toggleSet(exId: number, setIdx: number) {
    const key = `${exId}-${setIdx}`
    setChecked(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function formatTimer(s: number) {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }

  const total = DUMMY_EXERCISES.length
  const done = DUMMY_EXERCISES.filter(ex =>
    Array.from({ length: ex.sets }).every((_, i) => checked[`${ex.id}-${i}`])
  ).length

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-1">Demo · Workout</p>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-3xl font-bold">운동 트래커</h1>
          <HelpButton onClick={() => setHelpOpen(true)} />
        </div>
        <p className="text-gray-500 text-sm mb-6">더미 운동 목록으로 체험. 세트 체크·타이머가 동작하며 새로고침 시 초기화됩니다.</p>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">운동 시간</p>
            <p className="text-4xl font-mono font-bold text-indigo-400">{formatTimer(timerSec)}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimerRunning(r => !r)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              {timerRunning ? '일시정지' : '시작'}
            </button>
            <button
              onClick={() => { setTimerRunning(false); setTimerSec(0) }}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors cursor-pointer"
            >
              초기화
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 bg-gray-800 rounded-full h-2">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${total ? (done / total) * 100 : 0}%` }}
            />
          </div>
          <span className="text-sm text-gray-400 shrink-0">{done} / {total} 완료</span>
        </div>

        <div className="space-y-4">
          {DUMMY_EXERCISES.map(ex => {
            const allDone = Array.from({ length: ex.sets }).every((_, i) => checked[`${ex.id}-${i}`])
            return (
              <div
                key={ex.id}
                className={`bg-gray-900 border rounded-xl p-5 transition-all ${allDone ? 'border-indigo-500/30 opacity-60' : 'border-gray-800'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className={`font-semibold ${allDone ? 'line-through text-gray-500' : 'text-white'}`}>
                      {ex.name}
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {ex.weight > 0 ? `${ex.weight}${ex.unit} · ` : ''}
                      {ex.sets}세트 × {ex.reps}{ex.unit === 'sec' ? '초' : '회'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: ex.sets }).map((_, i) => {
                    const key = `${ex.id}-${i}`
                    return (
                      <button
                        key={i}
                        onClick={() => toggleSet(ex.id, i)}
                        className={`w-10 h-10 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                          checked[key]
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'border-gray-700 text-gray-500 hover:border-gray-500'
                        }`}
                      >
                        {i + 1}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {helpOpen && (
        <HelpModal title="💪 운동 트래커 — 구현 방식" onClose={() => setHelpOpen(false)}>
          <HelpSection label="이 데모 구현" items={['타이머: setInterval(1000ms) + useRef로 interval 관리', '세트 체크: Record<"exId-setIdx", boolean> 상태 관리', '진행률: 모든 세트 완료 운동 수 / 전체 운동 수 계산', '새로고침 시 초기화 (localStorage 미저장)']} />
          <HelpSection label="실제 버전 추가 기능" items={['Spring Boot JPA — exercises, workout_logs PostgreSQL 저장', 'Supabase Storage workout-videos 버킷에 운동 영상 저장', 'TTS: speechSynthesis.speak()로 세트 완료 음성 안내', '주간·월간 운동 통계 API']} />
        </HelpModal>
      )}
    </div>
  )
}
