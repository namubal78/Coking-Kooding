'use client'

import { useState, useRef, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { HelpButton, HelpModal, HelpSection } from '@/components/HelpModal'

interface Message {
  id: number
  senderName: string
  senderEmail: string
  content: string
  createdAt: string
}

const MY_EMAIL = 'demo@me.com'
const MY_NAME = '은새아빠'

const DUMMY_MESSAGES: Message[] = [
  { id: 1, senderName: '은새엄마', senderEmail: 'jhk@demo.com', content: '오늘 저녁 뭐 먹을까요?', createdAt: '2026-04-28T11:20:00Z' },
  { id: 2, senderName: '은새아빠', senderEmail: MY_EMAIL, content: '삼겹살 어때요?', createdAt: '2026-04-28T11:21:00Z' },
  { id: 3, senderName: '은새엄마', senderEmail: 'jhk@demo.com', content: '좋아요! 상추도 사올게요', createdAt: '2026-04-28T11:22:00Z' },
  { id: 4, senderName: '은새아빠', senderEmail: MY_EMAIL, content: '오케이 6시에 집 도착할게요', createdAt: '2026-04-28T11:23:00Z' },
  { id: 5, senderName: '은새엄마', senderEmail: 'jhk@demo.com', content: '은새가 오늘 피아노 연습 열심히 했어요', createdAt: '2026-04-28T11:25:00Z' },
]

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
}

export default function DemoMessengerPage() {
  const [messages, setMessages] = useState<Message[]>(DUMMY_MESSAGES)
  const [input, setInput] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send() {
    const text = input.trim()
    if (!text) return
    setMessages(prev => [...prev, {
      id: Date.now(),
      senderName: MY_NAME,
      senderEmail: MY_EMAIL,
      content: text,
      createdAt: new Date().toISOString(),
    }])
    setInput('')
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  let lastDate = ''

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 pt-24 pb-0">
        <div className="mb-3">
          <p className="text-indigo-400 text-xs font-semibold tracking-widest uppercase mb-1">Demo · Messenger</p>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold">은새네 가족 채팅</h1>
            <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">로컬 데모</span>
            <HelpButton onClick={() => setHelpOpen(true)} />
          </div>
          <p className="text-gray-600 text-xs">메시지를 입력해보세요. 새로고침 시 초기화됩니다.</p>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-1 min-h-[300px] max-h-[55vh]">
          {messages.map((msg, i) => {
            const isMine = msg.senderEmail === MY_EMAIL
            const msgDate = new Date(msg.createdAt).toDateString()
            const showDate = msgDate !== lastDate
            if (showDate) lastDate = msgDate
            const prevMsg = messages[i - 1]
            const showSender = !isMine && (!prevMsg || prevMsg.senderEmail !== msg.senderEmail)

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                )}
                <div className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                  {!isMine && (
                    <div className="w-7 h-7 rounded-full bg-purple-700 flex-shrink-0 flex items-center justify-center text-xs text-white font-bold mb-0.5">
                      {msg.senderName[0]}
                    </div>
                  )}
                  <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    {showSender && (
                      <span className="text-xs text-gray-400 mb-1 ml-1">{msg.senderName}</span>
                    )}
                    <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                      isMine
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : 'bg-gray-800 text-gray-100 rounded-bl-sm'
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-gray-600 mt-0.5 mx-1">{formatTime(msg.createdAt)}</span>
                  </div>
                  {isMine && (
                    <div className="w-7 h-7 rounded-full bg-indigo-700 flex-shrink-0 flex items-center justify-center text-xs text-white font-bold mb-0.5">
                      {MY_NAME[0]}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        <div className="py-3 border-t border-gray-800">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="메시지를 입력하세요... (Enter로 전송)"
              rows={1}
              className="flex-1 bg-gray-800 text-white text-sm rounded-xl px-4 py-2.5 resize-none outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500 leading-relaxed"
              style={{ minHeight: '42px', maxHeight: '120px' }}
            />
            <button
              onClick={send}
              disabled={!input.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl transition-colors text-sm font-medium cursor-pointer"
            >
              전송
            </button>
          </div>
        </div>
      </main>

      {helpOpen && (
        <HelpModal title="💬 가족 메신저 — 구현 방식" onClose={() => setHelpOpen(false)}>
          <HelpSection label="이 데모" items={[
            'React state만 사용 — 실제 WebSocket 연결 없음',
            '새로고침 시 더미 메시지로 초기화',
          ]} />
          <HelpSection label="실제 버전 WebSocket 연결" items={[
            'STOMP + SockJS: ws://{API}/ws?token={JWT}',
            '쿼리파라미터로 JWT 전달 (브라우저 WebSocket API는 커스텀 헤더 불가)',
            'JwtHandshakeInterceptor: 핸드셰이크 전 JWT 검증',
            '구독: /topic/messages (메시지), /topic/reads (읽음 상태)',
            '발행: /app/chat.send → @MessageMapping 핸들러 → DB 저장 + 브로드캐스트',
          ]} />
          <HelpSection label="읽음 처리 & 알림" items={[
            'message_reads 테이블: userEmail(PK), lastReadId',
            'POST /api/messenger/read → lastReadId 업데이트 → /topic/reads 브로드캐스트',
            '미읽음 수: COUNT(messages.id) WHERE id > lastReadId',
            'VAPID Web Push: 새 메시지 시 다른 구독자에게 백그라운드 푸시 발송',
            'navigator.setAppBadge(n): iOS PWA 홈 아이콘 뱃지 업데이트',
          ]} />
        </HelpModal>
      )}
    </div>
  )
}
