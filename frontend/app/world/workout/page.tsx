'use client'

import { useEffect, useRef, useState } from 'react'
import Navbar from '@/components/Navbar'
import { apiFetch, apiUpload } from '@/lib/api'

type Exercise = { id: number; name: string; totalSets: number; orderIndex: number; restSeconds: number }
type WorkoutLog = { exerciseId: number; date: string; completedSets: number }
type DayStat = { date: string; totalSets: number; completedSets: number; completionRate: number }
type DetailStat = { exerciseId: number; name: string; completedSets: number; totalSets: number; completionRate: number }
type RestTimer = { name: string; secondsLeft: number; total: number }

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'ko-KR'
  u.rate = 0.95
  window.speechSynthesis.speak(u)
}

export default function WorkoutPage() {
  const today = fmt(new Date())

  // ── 데이터 ──────────────────────────────────────────────────────
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [loading, setLoading] = useState(true)

  // ── UI ───────────────────────────────────────────────────────────
  const [flash, setFlash] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEx, setNewEx] = useState({ name: '', totalSets: 3, restSeconds: 60 })

  // ── 음성인식 ─────────────────────────────────────────────────────
  const [micOn, setMicOn] = useState(false)
  const micOnRef = useRef(false)
  const recognitionRef = useRef<any>(null)
  const exercisesRef = useRef<Exercise[]>([])

  // ── 휴식 타이머 ──────────────────────────────────────────────────
  const [restTimer, setRestTimer] = useState<RestTimer | null>(null)
  const alerted5Ref = useRef(false)

  // ── 운동 모달 (동영상 + 휴식 설정) ────────────────────────────────
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoLoading, setVideoLoading] = useState(false)
  const [restInput, setRestInput] = useState(60)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── 통계 ─────────────────────────────────────────────────────────
  const [statsMode, setStatsMode] = useState<'week' | 'month'>('week')
  const [weekOffset, setWeekOffset] = useState(0)
  const [monthCursor, setMonthCursor] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() })
  const [stats, setStats] = useState<DayStat[]>([])
  const [selectedStatDate, setSelectedStatDate] = useState<string | null>(null)
  const [detailStats, setDetailStats] = useState<DetailStat[]>([])

  // ── 초기 로드 ────────────────────────────────────────────────────

  useEffect(() => { loadAll() }, [])

  useEffect(() => {
    loadStats()
    setSelectedStatDate(null)
    setDetailStats([])
  }, [statsMode, weekOffset, monthCursor.year, monthCursor.month])

  async function loadAll() {
    setLoading(true)
    try {
      const [exRes, logRes] = await Promise.all([
        apiFetch('/api/workout/exercises').then(r => r.json()),
        apiFetch(`/api/workout/logs?date=${today}`).then(r => r.json()),
      ])
      setExercises(exRes)
      exercisesRef.current = exRes
      setLogs(logRes)
    } finally {
      setLoading(false)
    }
    loadStats()
  }

  function getStatRange() {
    if (statsMode === 'week') {
      const end = new Date()
      end.setDate(end.getDate() + weekOffset * 7)
      const start = new Date(end)
      start.setDate(start.getDate() - 6)
      return { start: fmt(start), end: fmt(end) }
    } else {
      const first = fmt(new Date(monthCursor.year, monthCursor.month, 1))
      const last = fmt(new Date(monthCursor.year, monthCursor.month + 1, 0))
      return { start: first, end: last <= today ? last : today }
    }
  }

  async function loadStats() {
    const { start, end } = getStatRange()
    try {
      const res = await apiFetch(`/api/workout/stats?start=${start}&end=${end}`).then(r => r.json())
      setStats(res)
    } catch {}
  }

  async function selectStatDate(date: string) {
    if (date === selectedStatDate) { setSelectedStatDate(null); setDetailStats([]); return }
    setSelectedStatDate(date)
    try {
      const res = await apiFetch(`/api/workout/stats/detail?date=${date}`).then(r => r.json())
      setDetailStats(res)
    } catch {}
  }

  // ── 세트 증가 + TTS + 휴식 타이머 ──────────────────────────────────

  async function increment(exerciseId: number) {
    const ex = exercisesRef.current.find(e => e.id === exerciseId)
    if (!ex) return
    const res: WorkoutLog = await apiFetch(
      `/api/workout/logs/${exerciseId}/increment?date=${today}`,
      { method: 'POST' }
    ).then(r => r.json())

    setLogs(prev => {
      const exists = prev.find(l => l.exerciseId === exerciseId)
      return exists ? prev.map(l => l.exerciseId === exerciseId ? res : l) : [...prev, res]
    })

    const msg = `${ex.name} ${res.completedSets}세트 완료`
    setFlash(msg + '!')
    setTimeout(() => setFlash(''), 3000)
    speak(msg)

    if (ex.restSeconds > 0) {
      alerted5Ref.current = false
      setRestTimer({ name: ex.name, secondsLeft: ex.restSeconds, total: ex.restSeconds })
    }

    loadStats()
  }

  // ── 휴식 타이머 카운트다운 ────────────────────────────────────────

  useEffect(() => {
    if (!restTimer || restTimer.secondsLeft <= 0) return
    const id = setTimeout(() => {
      setRestTimer(prev => {
        if (!prev) return null
        const next = prev.secondsLeft - 1
        if (next === 5 && !alerted5Ref.current) {
          alerted5Ref.current = true
          speak('5초 뒤 휴식 종료입니다')
        }
        if (next <= 0) return null
        return { ...prev, secondsLeft: next }
      })
    }, 1000)
    return () => clearTimeout(id)
  }, [restTimer?.secondsLeft])

  // ── 음성인식 ──────────────────────────────────────────────────────

  function toggleMic() { micOnRef.current ? stopMic() : startMic() }

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
          if (ex) await increment(ex.id)
        }
      } catch {}
    }

    rec.onend = () => { if (micOnRef.current) { try { rec.start() } catch {} } }
    micOnRef.current = true
    setMicOn(true)
    rec.start()
  }

  function stopMic() {
    micOnRef.current = false
    setMicOn(false)
    recognitionRef.current?.stop()
  }

  // ── 운동 CRUD ──────────────────────────────────────────────────────

  async function addExercise() {
    if (!newEx.name.trim()) return
    const res: Exercise = await apiFetch('/api/workout/exercises', {
      method: 'POST',
      body: JSON.stringify({ name: newEx.name, totalSets: newEx.totalSets, orderIndex: 0, restSeconds: newEx.restSeconds }),
    }).then(r => r.json())
    const updated = [...exercisesRef.current, res]
    setExercises(updated)
    exercisesRef.current = updated
    setNewEx({ name: '', totalSets: 3, restSeconds: 60 })
    setShowAddForm(false)
  }

  async function deleteExercise(id: number) {
    if (!confirm('삭제할까요?')) return
    await apiFetch(`/api/workout/exercises/${id}`, { method: 'DELETE' })
    const updated = exercisesRef.current.filter(e => e.id !== id)
    setExercises(updated)
    exercisesRef.current = updated
    setLogs(prev => prev.filter(l => l.exerciseId !== id))
    if (selectedEx?.id === id) setSelectedEx(null)
  }

  // ── 운동 모달 (동영상 + 휴식) ─────────────────────────────────────

  function openExModal(ex: Exercise) {
    setSelectedEx(ex)
    setRestInput(ex.restSeconds)
    setVideoUrl('')
    setVideoLoading(true)
    apiFetch(`/api/workout/exercises/${ex.id}/video`).then(r => r.json())
      .then(data => setVideoUrl(data.url ?? ''))
      .catch(() => setVideoUrl(''))
      .finally(() => setVideoLoading(false))
  }

  async function saveRestSeconds() {
    if (!selectedEx) return
    const res: Exercise = await apiFetch(`/api/workout/exercises/${selectedEx.id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: selectedEx.name, totalSets: selectedEx.totalSets, orderIndex: selectedEx.orderIndex, restSeconds: restInput }),
    }).then(r => r.json())
    const updated = exercisesRef.current.map(e => e.id === res.id ? res : e)
    setExercises(updated)
    exercisesRef.current = updated
    setSelectedEx(res)
  }

  async function uploadVideo(file: File) {
    if (!selectedEx) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await apiUpload(`/api/workout/exercises/${selectedEx.id}/video`, fd).then(r => r.json())
      setVideoUrl(res.url ?? '')
    } finally {
      setUploading(false)
    }
  }

  // ── 통계 헬퍼 ─────────────────────────────────────────────────────

  function getCompleted(exerciseId: number) {
    return logs.find(l => l.exerciseId === exerciseId)?.completedSets ?? 0
  }

  const statsSummary = (() => {
    if (stats.length === 0) return null
    const daysWithWork = stats.filter(s => s.completedSets > 0).length
    const avg = stats.reduce((acc, s) => acc + s.completionRate, 0) / stats.length
    return { avg: Math.round(avg), days: daysWithWork, total: stats.length }
  })()

  function statsPeriodLabel() {
    const { start, end } = getStatRange()
    if (statsMode === 'week') return `${start} ~ ${end}`
    return `${monthCursor.year}년 ${monthCursor.month + 1}월`
  }

  // ── 월간 캘린더 셀 ────────────────────────────────────────────────

  function monthCalendarCells() {
    const { start } = getStatRange()
    const firstDay = new Date(monthCursor.year, monthCursor.month, 1)
    const startOffset = firstDay.getDay()
    const daysInMonth = new Date(monthCursor.year, monthCursor.month + 1, 0).getDate()
    const cells: (DayStat | null)[] = Array.from({ length: startOffset }, () => null)
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${monthCursor.year}-${String(monthCursor.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      cells.push(stats.find(s => s.date === key) ?? { date: key, totalSets: 0, completedSets: 0, completionRate: 0 })
    }
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }

  function completionColor(rate: number, future: boolean) {
    if (future) return 'bg-gray-900'
    if (rate >= 100) return 'bg-emerald-600'
    if (rate >= 70) return 'bg-indigo-500'
    if (rate >= 30) return 'bg-indigo-800'
    if (rate > 0) return 'bg-gray-700'
    return 'bg-gray-900'
  }

  // ─────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 pt-20 pb-10">

        {/* ── 헤더 ── */}
        <div className="flex items-center justify-between py-4">
          <div>
            <h2 className="text-xl font-bold">운동</h2>
            <p className="text-sm text-gray-500 mt-0.5">{today}</p>
          </div>
          <div className="flex items-center gap-2">
            {flash && <span className="text-sm text-emerald-400 font-medium animate-pulse">{flash}</span>}
            <button
              onClick={toggleMic}
              title={micOn ? '마이크 끄기' : '상시 음성인식 켜기'}
              className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all cursor-pointer text-lg
                ${micOn ? 'bg-red-600 border-red-500 animate-pulse' : 'border-gray-700 hover:bg-gray-800 text-gray-400'}`}
            >🎤</button>
            <button
              onClick={() => setShowAddForm(v => !v)}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >+ 추가</button>
          </div>
        </div>

        {/* ── 휴식 타이머 배너 ── */}
        {restTimer && (
          <div className="mb-3 bg-indigo-950 border border-indigo-800 rounded-xl px-4 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-indigo-300">💤 {restTimer.name} 휴식 중</span>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-mono font-bold ${restTimer.secondsLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
                  {restTimer.secondsLeft}초
                </span>
                <button onClick={() => setRestTimer(null)} className="text-gray-600 hover:text-gray-300 text-xs cursor-pointer">✕</button>
              </div>
            </div>
            <div className="w-full h-1.5 bg-indigo-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-400 transition-all duration-1000"
                style={{ width: `${(restTimer.secondsLeft / restTimer.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ── 운동 추가 폼 ── */}
        {showAddForm && (
          <div className="mb-4 p-4 bg-gray-900 border border-gray-700 rounded-xl flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[120px]">
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
            <div className="w-20">
              <label className="text-xs text-gray-500 mb-1 block">세트</label>
              <input type="number" min={1} max={30}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={newEx.totalSets}
                onChange={e => setNewEx(v => ({ ...v, totalSets: Number(e.target.value) }))}
              />
            </div>
            <div className="w-24">
              <label className="text-xs text-gray-500 mb-1 block">휴식(초)</label>
              <input type="number" min={0} max={600}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={newEx.restSeconds}
                onChange={e => setNewEx(v => ({ ...v, restSeconds: Number(e.target.value) }))}
              />
            </div>
            <button onClick={addExercise} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium cursor-pointer">추가</button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-gray-700 rounded-lg text-sm text-gray-400 hover:text-white cursor-pointer">취소</button>
          </div>
        )}

        {/* ── 운동 목록 ── */}
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
              const done = completed >= ex.totalSets
              return (
                <div key={ex.id} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => openExModal(ex)}
                      className="text-sm font-semibold text-white w-28 shrink-0 truncate text-left hover:text-indigo-300 transition-colors cursor-pointer"
                      title="동영상 / 설정"
                    >
                      {ex.name}
                    </button>
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
                        >✓</button>
                      ))}
                    </div>
                    <span className={`text-xs shrink-0 font-mono ${done ? 'text-emerald-400' : 'text-gray-500'}`}>
                      {completed}/{ex.totalSets}
                    </span>
                    <button onClick={() => deleteExercise(ex.id)} className="text-gray-700 hover:text-red-400 text-xs cursor-pointer shrink-0">✕</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── 운동 모달 ── */}
        {selectedEx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setSelectedEx(null)}>
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-5 space-y-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold">{selectedEx.name}</h3>
                <button onClick={() => setSelectedEx(null)} className="text-gray-500 hover:text-white cursor-pointer">✕</button>
              </div>

              {/* 동영상 */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium">동영상</p>
                {videoLoading ? (
                  <div className="h-32 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : videoUrl ? (
                  <video src={videoUrl} controls playsInline className="w-full rounded-lg max-h-48 bg-black" />
                ) : (
                  <div className="h-28 bg-gray-950 border border-gray-800 rounded-lg flex items-center justify-center text-gray-700 text-sm">
                    동영상 없음
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="video/*" className="hidden"
                  onChange={e => e.target.files?.[0] && uploadVideo(e.target.files[0])} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full py-2 text-sm border border-gray-700 hover:border-indigo-500 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
                >
                  {uploading ? '업로드 중...' : '동영상 업로드'}
                </button>
              </div>

              {/* 휴식 시간 */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium">세트 후 휴식 시간</p>
                <div className="flex gap-2">
                  <input type="number" min={0} max={600}
                    className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    value={restInput}
                    onChange={e => setRestInput(Number(e.target.value))}
                  />
                  <span className="flex items-center text-sm text-gray-500">초</span>
                  <button onClick={saveRestSeconds}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium cursor-pointer">
                    저장
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 통계 ── */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-400">통계</h3>
            <div className="flex rounded-lg overflow-hidden border border-gray-800 text-xs">
              {(['week', 'month'] as const).map(m => (
                <button key={m} onClick={() => setStatsMode(m)}
                  className={`px-3 py-1.5 cursor-pointer transition-colors ${statsMode === m ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}>
                  {m === 'week' ? '주간' : '월간'}
                </button>
              ))}
            </div>
          </div>

          {/* 기간 네비게이션 */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => statsMode === 'week'
                ? setWeekOffset(o => o - 1)
                : setMonthCursor(c => c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 })}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-800 text-gray-400 cursor-pointer">‹</button>
            <span className="text-xs text-gray-500">{statsPeriodLabel()}</span>
            <button
              onClick={() => statsMode === 'week'
                ? setWeekOffset(o => Math.min(o + 1, 0))
                : setMonthCursor(c => c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 })}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-800 text-gray-400 cursor-pointer">›</button>
          </div>

          {/* 요약 */}
          {statsSummary && (
            <div className="flex gap-4 mb-4 px-1">
              <span className="text-sm text-indigo-400 font-semibold">평균 {statsSummary.avg}%</span>
              <span className="text-sm text-gray-500">{statsSummary.days}일 완료 / {statsSummary.total}일</span>
            </div>
          )}

          {/* 주간: 7 바 차트 */}
          {statsMode === 'week' && stats.length > 0 && (
            <div className="grid grid-cols-7 gap-1.5">
              {stats.map(s => {
                const d = new Date(s.date + 'T00:00:00')
                const isToday = s.date === today
                const rate = Math.round(s.completionRate)
                const selected = s.date === selectedStatDate
                return (
                  <button key={s.date} onClick={() => selectStatDate(s.date)} className="flex flex-col items-center gap-1 cursor-pointer group">
                    <span className={`text-xs font-medium ${isToday ? 'text-indigo-400' : 'text-gray-600'}`}>{WEEKDAYS[d.getDay()]}</span>
                    <div className={`w-full h-20 rounded-lg overflow-hidden flex flex-col justify-end border transition-colors relative
                      ${selected ? 'border-indigo-500' : 'border-gray-800 group-hover:border-gray-700'}
                      bg-gray-900`}>
                      <div className={`w-full transition-all ${rate >= 100 ? 'bg-emerald-600' : 'bg-indigo-600'}`} style={{ height: `${Math.max(rate, 0)}%` }} />
                      {rate > 0 && (
                        <span className="absolute inset-0 flex items-center justify-center text-[11px] text-white font-semibold drop-shadow">{rate}%</span>
                      )}
                    </div>
                    <span className={`text-[10px] ${isToday ? 'text-indigo-400 font-bold' : 'text-gray-600'}`}>{d.getDate()}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* 월간: 캘린더 그리드 */}
          {statsMode === 'month' && (
            <div>
              <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS.map((d, i) => (
                  <div key={d} className={`text-center text-[10px] py-1 ${i === 0 ? 'text-rose-400' : i === 6 ? 'text-sky-400' : 'text-gray-600'}`}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthCalendarCells().map((cell, i) => {
                  if (!cell) return <div key={`e-${i}`} />
                  const d = new Date(cell.date + 'T00:00:00')
                  const isFuture = cell.date > today
                  const rate = Math.round(cell.completionRate)
                  const isToday = cell.date === today
                  const selected = cell.date === selectedStatDate
                  return (
                    <button
                      key={cell.date}
                      onClick={() => !isFuture && selectStatDate(cell.date)}
                      disabled={isFuture}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[11px] font-medium border transition-colors cursor-pointer
                        ${completionColor(rate, isFuture)}
                        ${selected ? 'border-indigo-400' : isToday ? 'border-indigo-600' : 'border-transparent'}
                        ${isFuture ? 'opacity-30 cursor-default' : 'hover:opacity-80'}`}
                    >
                      <span className={isToday ? 'text-white font-bold' : rate > 0 ? 'text-white' : 'text-gray-600'}>{d.getDate()}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 날짜별 세부 통계 */}
          {selectedStatDate && detailStats.length > 0 && (
            <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
              <p className="text-xs text-gray-500 font-medium mb-3">{selectedStatDate} 세부</p>
              {detailStats.map(s => {
                const rate = Math.round(s.completionRate)
                return (
                  <div key={s.exerciseId}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white">{s.name}</span>
                      <span className={`text-xs font-mono ${rate >= 100 ? 'text-emerald-400' : rate > 0 ? 'text-indigo-400' : 'text-gray-600'}`}>
                        {s.completedSets}/{s.totalSets} ({rate}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${rate >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
