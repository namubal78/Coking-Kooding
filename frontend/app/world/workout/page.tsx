'use client'

import { useEffect, useRef, useState } from 'react'
import Navbar from '@/components/Navbar'
import { apiFetch } from '@/lib/api'

type Exercise = { id: number; name: string; totalSets: number; orderIndex: number }
type WorkoutLog = { exerciseId: number; date: string; completedSets: number }
type DayStat = { date: string; totalSets: number; completedSets: number; completionRate: number }

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function weekStartStr() {
  const d = new Date()
  d.setDate(d.getDate() - 6)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function WorkoutPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [stats, setStats] = useState<DayStat[]>([])
  const [loading, setLoading] = useState(true)
  const [micOn, setMicOn] = useState(false)
  const [flash, setFlash] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEx, setNewEx] = useState({ name: '', totalSets: 3 })

  const micOnRef = useRef(false)
  const recognitionRef = useRef<any>(null)
  const exercisesRef = useRef<Exercise[]>([])

  const today = todayStr()

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [exRes, logRes, statsRes] = await Promise.all([
        apiFetch('/api/workout/exercises').then(r => r.json()),
        apiFetch(`/api/workout/logs?date=${today}`).then(r => r.json()),
        apiFetch(`/api/workout/stats?start=${weekStartStr()}&end=${today}`).then(r => r.json()),
      ])
      setExercises(exRes)
      exercisesRef.current = exRes
      setLogs(logRes)
      setStats(statsRes)
    } finally {
      setLoading(false)
    }
  }

  function getCompleted(exerciseId: number) {
    return logs.find(l => l.exerciseId === exerciseId)?.completedSets ?? 0
  }

  async function increment(exerciseId: number) {
    const res: WorkoutLog = await apiFetch(
      `/api/workout/logs/${exerciseId}/increment?date=${today}`,
      { method: 'POST' }
    ).then(r => r.json())

    setLogs(prev => {
      const exists = prev.find(l => l.exerciseId === exerciseId)
      return exists ? prev.map(l => l.exerciseId === exerciseId ? res : l) : [...prev, res]
    })

    const statsRes = await apiFetch(
      `/api/workout/stats?start=${weekStartStr()}&end=${today}`
    ).then(r => r.json())
    setStats(statsRes)
  }

  function toggleMic() {
    if (micOnRef.current) stopMic()
    else startMic()
  }

  function startMic() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert('Chrome 브라우저를 사용해주세요'); return }

    const rec = new SR()
    rec.lang = 'ko-KR'
    rec.continuous = true
    rec.interimResults = false
    recognitionRef.current = rec

    rec.onresult = async (e: any) => {
      const text = e.results[e.results.length - 1][0].transcript
      const names = exercisesRef.current.map(ex => ex.name)
      try {
        const res = await apiFetch('/api/workout/voice', {
          method: 'POST',
          body: JSON.stringify({ text, exerciseNames: names }),
        }).then(r => r.json())

        const name = res.exerciseName
        if (name) {
          const ex = exercisesRef.current.find(e => e.name === name)
          if (ex) {
            await increment(ex.id)
            setFlash(`"${name}" 한 세트 완료!`)
            setTimeout(() => setFlash(''), 3000)
          }
        }
      } catch {}
    }

    rec.onend = () => {
      if (micOnRef.current) {
        try { rec.start() } catch {}
      }
    }

    micOnRef.current = true
    setMicOn(true)
    rec.start()
  }

  function stopMic() {
    micOnRef.current = false
    setMicOn(false)
    recognitionRef.current?.stop()
  }

  async function addExercise() {
    if (!newEx.name.trim()) return
    const res: Exercise = await apiFetch('/api/workout/exercises', {
      method: 'POST',
      body: JSON.stringify({ name: newEx.name, totalSets: newEx.totalSets, orderIndex: 0 }),
    }).then(r => r.json())
    const updated = [...exercisesRef.current, res]
    setExercises(updated)
    exercisesRef.current = updated
    setNewEx({ name: '', totalSets: 3 })
    setShowAddForm(false)
  }

  async function deleteExercise(id: number) {
    if (!confirm('삭제할까요?')) return
    await apiFetch(`/api/workout/exercises/${id}`, { method: 'DELETE' })
    const updated = exercisesRef.current.filter(e => e.id !== id)
    setExercises(updated)
    exercisesRef.current = updated
    setLogs(prev => prev.filter(l => l.exerciseId !== id))
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 pt-20 pb-10">

        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <div>
            <h2 className="text-xl font-bold">운동</h2>
            <p className="text-sm text-gray-500 mt-0.5">{today}</p>
          </div>
          <div className="flex items-center gap-2">
            {flash && (
              <span className="text-sm text-emerald-400 font-medium animate-pulse">{flash}</span>
            )}
            <button
              onClick={toggleMic}
              title={micOn ? '마이크 끄기' : '상시 음성인식 켜기'}
              className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all cursor-pointer text-lg
                ${micOn ? 'bg-red-600 border-red-500 animate-pulse' : 'border-gray-700 hover:bg-gray-800 text-gray-400'}`}
            >
              🎤
            </button>
            <button
              onClick={() => setShowAddForm(v => !v)}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              + 추가
            </button>
          </div>
        </div>

        {/* 운동 추가 폼 */}
        {showAddForm && (
          <div className="mb-4 p-4 bg-gray-900 border border-gray-700 rounded-xl flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">운동 이름</label>
              <input
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="예: 스쿼트"
                value={newEx.name}
                onChange={e => setNewEx(v => ({ ...v, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addExercise()}
                autoFocus
              />
            </div>
            <div className="w-24">
              <label className="text-xs text-gray-500 mb-1 block">목표 세트</label>
              <input
                type="number" min={1} max={30}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={newEx.totalSets}
                onChange={e => setNewEx(v => ({ ...v, totalSets: Number(e.target.value) }))}
              />
            </div>
            <button onClick={addExercise} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium cursor-pointer">추가</button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-gray-700 rounded-lg text-sm text-gray-400 hover:text-white cursor-pointer">취소</button>
          </div>
        )}

        {/* 운동 테이블 */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : exercises.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <p className="text-5xl mb-4">💪</p>
            <p className="text-sm">운동을 추가해보세요</p>
          </div>
        ) : (
          <div className="space-y-2">
            {exercises.map(ex => {
              const completed = getCompleted(ex.id)
              return (
                <div key={ex.id} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-semibold text-white w-28 shrink-0 truncate">{ex.name}</span>
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {Array.from({ length: ex.totalSets }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => i >= completed && increment(ex.id)}
                          className={`w-7 h-7 rounded border-2 transition-all flex items-center justify-center text-xs font-bold
                            ${i < completed
                              ? 'bg-indigo-600 border-indigo-500 text-white cursor-default'
                              : 'border-gray-700 hover:border-indigo-400 text-transparent hover:text-indigo-400 cursor-pointer'
                            }`}
                        >
                          ✓
                        </button>
                      ))}
                    </div>
                    <span className={`text-xs shrink-0 font-mono ${completed >= ex.totalSets ? 'text-emerald-400' : 'text-gray-500'}`}>
                      {completed}/{ex.totalSets}
                    </span>
                    <button
                      onClick={() => deleteExercise(ex.id)}
                      className="text-gray-700 hover:text-red-400 text-xs cursor-pointer shrink-0 ml-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 주간 통계 */}
        {stats.length > 0 && (
          <div className="mt-10">
            <h3 className="text-sm font-semibold text-gray-400 mb-4">최근 7일</h3>
            <div className="grid grid-cols-7 gap-1.5">
              {stats.map(s => {
                const d = new Date(s.date + 'T00:00:00')
                const isToday = s.date === today
                const rate = Math.round(s.completionRate)
                return (
                  <div key={s.date} className="flex flex-col items-center gap-1">
                    <span className={`text-xs font-medium ${isToday ? 'text-indigo-400' : 'text-gray-600'}`}>
                      {WEEKDAYS[d.getDay()]}
                    </span>
                    <div className="w-full h-20 bg-gray-900 rounded-lg overflow-hidden flex flex-col justify-end border border-gray-800 relative">
                      <div
                        className={`w-full transition-all ${rate >= 100 ? 'bg-emerald-600' : 'bg-indigo-600'}`}
                        style={{ height: `${Math.max(rate, 0)}%` }}
                      />
                      {rate > 0 && (
                        <span className="absolute inset-0 flex items-center justify-center text-[11px] text-white font-semibold drop-shadow">
                          {rate}%
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] ${isToday ? 'text-indigo-400 font-bold' : 'text-gray-600'}`}>
                      {d.getDate()}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
