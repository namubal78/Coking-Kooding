'use client'

import { useEffect, useRef, useState } from 'react'
import Navbar from '@/components/Navbar'
import { apiFetch, apiUpload } from '@/lib/api'

type Exercise = { id: number; name: string; totalSets: number; orderIndex: number; restSeconds: number; durationSeconds: number }
type WorkoutLog = { exerciseId: number; date: string; completedSets: number }
type DayStat = { date: string; totalSets: number; completedSets: number; completionRate: number }
type DetailStat = { exerciseId: number; name: string; completedSets: number; totalSets: number; completionRate: number }
type RestTimer = { exerciseId: number; name: string; secondsLeft: number; total: number }
type WorkoutTimer = { exerciseId: number; name: string; secondsLeft: number; total: number }

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatTime(seconds: number) {
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }
  return `${seconds}초`
}

export default function WorkoutPage() {
  const today = fmt(new Date())

  // ── 데이터 ──────────────────────────────────────────────────────
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [loading, setLoading] = useState(true)
  const exercisesRef = useRef<Exercise[]>([])
  const logsRef = useRef<WorkoutLog[]>([])

  // ── UI ───────────────────────────────────────────────────────────
  const [flash, setFlash] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEx, setNewEx] = useState({ name: '', totalSets: 3, restSeconds: 60, durationSeconds: 0 })

  // ── 음성인식 ─────────────────────────────────────────────────────
  const [micOn, setMicOn] = useState(false)
  const micOnRef = useRef(false)
  const recognitionRef = useRef<any>(null)

  // ── TTS 볼륨 ─────────────────────────────────────────────────────
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const volumeRef = useRef(0.8)
  const mutedRef = useRef(false)

  // ── 운동 타이머 ──────────────────────────────────────────────────
  const [workoutTimer, setWorkoutTimer] = useState<WorkoutTimer | null>(null)
  const alerted30Ref = useRef(false)
  const alerted10Ref = useRef(false)

  // ── 휴식 타이머 ──────────────────────────────────────────────────
  const [restTimer, setRestTimer] = useState<RestTimer | null>(null)
  const alerted5Ref = useRef(false)

  // ── 운동 모달 ────────────────────────────────────────────────────
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoLoading, setVideoLoading] = useState(false)
  const [restInput, setRestInput] = useState(60)
  const [durationInput, setDurationInput] = useState(0)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── 통계 ─────────────────────────────────────────────────────────
  const [statsMode, setStatsMode] = useState<'week' | 'month'>('week')
  const [weekOffset, setWeekOffset] = useState(0)
  const [monthCursor, setMonthCursor] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() })
  const [stats, setStats] = useState<DayStat[]>([])
  const [selectedStatDate, setSelectedStatDate] = useState<string | null>(null)
  const [detailStats, setDetailStats] = useState<DetailStat[]>([])

  // ── Ref 동기화 ───────────────────────────────────────────────────
  // TTS speak()와 타이머 콜백은 클로저로 캡처된 초기값을 바라본다(stale closure 문제).
  // Ref에 최신값을 동기화해두면 이벤트 핸들러가 항상 현재 volume/muted/logs를 읽을 수 있다.
  useEffect(() => { volumeRef.current = volume }, [volume])
  useEffect(() => { mutedRef.current = muted }, [muted])
  useEffect(() => { logsRef.current = logs }, [logs])

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

  // ── TTS ───────────────────────────────────────────────────────────
  function speak(text: string) {
    if (mutedRef.current) return
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ko-KR'
    u.rate = 0.95
    u.volume = volumeRef.current
    window.speechSynthesis.speak(u)
  }

  // ── 세트 증가 + TTS + 휴식 타이머 ──────────────────────────────────
  async function increment(exerciseId: number, fromTimer = false) {
    const ex = exercisesRef.current.find(e => e.id === exerciseId)
    if (!ex) return

    // 수동 클릭 시 해당 운동의 운동 타이머 취소
    if (!fromTimer && workoutTimer?.exerciseId === exerciseId) {
      setWorkoutTimer(null)
    }

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
      setRestTimer({ exerciseId: ex.id, name: ex.name, secondsLeft: ex.restSeconds, total: ex.restSeconds })
    }

    loadStats()
  }

  // ── 운동 타이머 카운트다운 ────────────────────────────────────────
  // 의존성을 workoutTimer?.secondsLeft 하나로 제한하는 이유:
  // workoutTimer 객체 전체를 dep로 쓰면 setWorkoutTimer 호출마다 새 객체가 생성되어 무한루프가 된다.
  // secondsLeft만 추적하면 1초마다 정확히 한 번씩 실행된다.
  useEffect(() => {
    if (!workoutTimer) return
    if (workoutTimer.secondsLeft <= 0) {
      const exerciseId = workoutTimer.exerciseId
      setWorkoutTimer(null)
      increment(exerciseId, true)
      return
    }
    const id = setTimeout(() => {
      setWorkoutTimer(prev => {
        if (!prev) return null
        const next = prev.secondsLeft - 1
        if (next === 30 && !alerted30Ref.current) {
          alerted30Ref.current = true
          speak('30초 남았습니다')
        }
        if (next === 10 && !alerted10Ref.current) {
          alerted10Ref.current = true
          speak('10초 남았습니다')
        }
        return { ...prev, secondsLeft: next }
      })
    }, 1000)
    return () => clearTimeout(id)
  }, [workoutTimer?.secondsLeft])

  // ── 휴식 타이머 카운트다운 ────────────────────────────────────────
  useEffect(() => {
    if (!restTimer) return
    if (restTimer.secondsLeft <= 0) {
      const { exerciseId } = restTimer
      setRestTimer(null)
      // 휴식 종료 후 자동 운동 타이머 시작 조건: durationSeconds가 설정되어 있고 세트가 남은 경우.
      // logsRef를 쓰는 이유: 이 클로저는 restTimer 변경 시점의 logs를 캡처하므로
      // 최신 completedSets를 읽으려면 Ref가 필요하다.
      const ex = exercisesRef.current.find(e => e.id === exerciseId)
      if (ex && ex.durationSeconds > 0) {
        const log = logsRef.current.find(l => l.exerciseId === exerciseId)
        const completed = log?.completedSets ?? 0
        if (completed < ex.totalSets) {
          alerted30Ref.current = false
          alerted10Ref.current = false
          setWorkoutTimer({ exerciseId: ex.id, name: ex.name, secondsLeft: ex.durationSeconds, total: ex.durationSeconds })
        }
      }
      return
    }
    const id = setTimeout(() => {
      setRestTimer(prev => {
        if (!prev) return null
        const next = prev.secondsLeft - 1
        if (next === 5 && !alerted5Ref.current) {
          alerted5Ref.current = true
          speak('5초 뒤 휴식 종료입니다')
        }
        return { ...prev, secondsLeft: next }
      })
    }, 1000)
    return () => clearTimeout(id)
  }, [restTimer?.secondsLeft])

  // ── 운동 타이머 시작 ──────────────────────────────────────────────
  function startWorkoutTimer(ex: Exercise) {
    if (!ex.durationSeconds || ex.durationSeconds <= 0) return
    alerted30Ref.current = false
    alerted10Ref.current = false
    setWorkoutTimer({ exerciseId: ex.id, name: ex.name, secondsLeft: ex.durationSeconds, total: ex.durationSeconds })
  }

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
      body: JSON.stringify({
        name: newEx.name,
        totalSets: newEx.totalSets,
        orderIndex: 0,
        restSeconds: newEx.restSeconds,
        durationSeconds: newEx.durationSeconds,
      }),
    }).then(r => r.json())
    const updated = [...exercisesRef.current, res]
    setExercises(updated)
    exercisesRef.current = updated
    setNewEx({ name: '', totalSets: 3, restSeconds: 60, durationSeconds: 0 })
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
    if (workoutTimer?.exerciseId === id) setWorkoutTimer(null)
    if (restTimer?.exerciseId === id) setRestTimer(null)
  }

  // ── 운동 모달 ─────────────────────────────────────────────────────
  function openExModal(ex: Exercise) {
    setSelectedEx(ex)
    setRestInput(ex.restSeconds)
    setDurationInput(ex.durationSeconds)
    setVideoUrl('')
    setVideoLoading(true)
    apiFetch(`/api/workout/exercises/${ex.id}/video`).then(r => r.json())
      .then(data => setVideoUrl(data.url ?? ''))
      .catch(() => setVideoUrl(''))
      .finally(() => setVideoLoading(false))
  }

  async function saveSettings() {
    if (!selectedEx) return
    const res: Exercise = await apiFetch(`/api/workout/exercises/${selectedEx.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: selectedEx.name,
        totalSets: selectedEx.totalSets,
        orderIndex: selectedEx.orderIndex,
        restSeconds: restInput,
        durationSeconds: durationInput,
      }),
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

  // ── 통계 ─────────────────────────────────────────────────────────
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

  function monthCalendarCells() {
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
          <div className="flex items-center gap-3">
            {flash && <span className="text-sm text-emerald-400 font-medium animate-pulse">{flash}</span>}

            {/* TTS 볼륨 컨트롤 */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setMuted(v => !v)}
                title={muted ? '음소거 해제' : '음소거'}
                className="text-base text-gray-400 hover:text-white transition-colors cursor-pointer w-6 text-center leading-none"
              >
                {muted ? '🔇' : volume >= 0.6 ? '🔊' : volume > 0 ? '🔉' : '🔈'}
              </button>
              <div className="relative w-16 h-4">
                <svg
                  viewBox="0 0 64 16"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <clipPath id="vol-clip">
                      <rect x="0" y="0" width={muted ? 0 : volume * 64} height="16" />
                    </clipPath>
                  </defs>
                  {/* 삼각형 배경 */}
                  <polygon points="0,16 64,16 64,0" fill="#374151" />
                  {/* 볼륨 채운 삼각형 */}
                  <polygon points="0,16 64,16 64,0" fill="#6366f1" clipPath="url(#vol-clip)" />
                </svg>
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={muted ? 0 : volume}
                  onChange={e => {
                    const v = Number(e.target.value)
                    setVolume(v > 0 ? v : 0.05)
                    setMuted(v === 0)
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <button
              disabled
              title="AI 음성 기능 일시 중단"
              className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-800 text-gray-600 cursor-not-allowed opacity-40 text-lg"
            >🎤</button>
            <button
              onClick={() => setShowAddForm(v => !v)}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >+ 추가</button>
          </div>
        </div>

        {/* ── 운동 타이머 배너 ── */}
        {workoutTimer && (
          <div className="mb-3 bg-amber-950 border border-amber-800 rounded-xl px-4 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-amber-300">💪 {workoutTimer.name} 운동 중</span>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-mono font-bold ${workoutTimer.secondsLeft <= 10 ? 'text-red-400 animate-pulse' : workoutTimer.secondsLeft <= 30 ? 'text-amber-400' : 'text-white'}`}>
                  {formatTime(workoutTimer.secondsLeft)}
                </span>
                <button
                  onClick={() => setWorkoutTimer(null)}
                  title="타이머 중지"
                  className="text-gray-600 hover:text-gray-300 text-xs cursor-pointer px-1"
                >■</button>
              </div>
            </div>
            <div className="w-full h-1.5 bg-amber-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-1000"
                style={{ width: `${(workoutTimer.secondsLeft / workoutTimer.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ── 휴식 타이머 배너 ── */}
        {restTimer && (
          <div className="mb-3 bg-indigo-950 border border-indigo-800 rounded-xl px-4 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-indigo-300">💤 {restTimer.name} 휴식 중</span>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-mono font-bold ${restTimer.secondsLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {formatTime(restTimer.secondsLeft)}
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
            <div className="w-16">
              <label className="text-xs text-gray-500 mb-1 block">세트</label>
              <input type="number" min={1} max={30}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={newEx.totalSets}
                onChange={e => setNewEx(v => ({ ...v, totalSets: Number(e.target.value) }))}
              />
            </div>
            <div className="w-20">
              <label className="text-xs text-gray-500 mb-1 block">운동(초)</label>
              <input type="number" min={0} max={3600}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                value={newEx.durationSeconds}
                onChange={e => setNewEx(v => ({ ...v, durationSeconds: Number(e.target.value) }))}
              />
            </div>
            <div className="w-20">
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
              const isTimerRunning = workoutTimer?.exerciseId === ex.id
              return (
                <div
                  key={ex.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 cursor-pointer hover:border-gray-700 transition-colors"
                  onClick={() => openExModal(ex)}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-semibold text-white w-24 shrink-0 truncate">{ex.name}</span>
                    <div className="flex flex-wrap gap-1.5 flex-1" onClick={e => e.stopPropagation()}>
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
                    {ex.durationSeconds > 0 && !done && (
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          isTimerRunning ? setWorkoutTimer(null) : startWorkoutTimer(ex)
                        }}
                        title={isTimerRunning ? '타이머 중지' : `${formatTime(ex.durationSeconds)} 운동 시작`}
                        className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-full border text-xs font-bold transition-all cursor-pointer
                          ${isTimerRunning
                            ? 'border-amber-500 text-amber-400 bg-amber-950 animate-pulse'
                            : 'border-gray-700 hover:border-amber-500 text-gray-500 hover:text-amber-400'
                          }`}
                      >
                        {isTimerRunning ? '■' : '▶'}
                      </button>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); deleteExercise(ex.id) }}
                      className="text-gray-700 hover:text-red-400 text-xs cursor-pointer shrink-0"
                    >✕</button>
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

              {/* 타이머 설정 */}
              <div className="space-y-3">
                <p className="text-xs text-gray-500 font-medium">타이머 설정</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">운동 시간(초)</label>
                    <input type="number" min={0} max={3600}
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                      value={durationInput}
                      onChange={e => setDurationInput(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">휴식 시간(초)</label>
                    <input type="number" min={0} max={600}
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={restInput}
                      onChange={e => setRestInput(Number(e.target.value))}
                    />
                  </div>
                </div>
                <button
                  onClick={saveSettings}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium cursor-pointer"
                >
                  저장
                </button>
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
          {selectedStatDate && detailStats.length > 0 && (() => {
            const done = detailStats.filter(s => s.completedSets > 0)
            const avgRate = Math.round(detailStats.reduce((acc, s) => acc + s.completionRate, 0) / detailStats.length)
            return (
              <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 font-medium mb-2">{selectedStatDate}</p>
                {done.length > 0 ? (
                  <p className="text-sm text-white leading-relaxed">
                    {done.map(s => `${s.name} ${s.completedSets}회`).join(' · ')}
                    <span className={`font-semibold ml-2 ${avgRate >= 100 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                      {' '}→ 총 {avgRate}%
                    </span>
                  </p>
                ) : (
                  <p className="text-gray-600 text-sm">운동 기록 없음</p>
                )}
              </div>
            )
          })()}
        </div>
      </main>
    </div>
  )
}
