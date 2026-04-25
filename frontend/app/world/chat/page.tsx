'use client'

import { useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { API_URL, apiFetch, getToken, parseJwt, getDisplayName } from '@/lib/api'

interface Message {
  id: number
  senderEmail: string
  senderName: string
  content: string
  createdAt: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const [myEmail, setMyEmail] = useState('')
  const clientRef = useRef<Client | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = getToken()
    if (!token) return

    const payload = parseJwt(token)
    if (payload?.sub) setMyEmail(payload.sub)

    apiFetch('/api/messenger/history')
      .then(r => r.json())
      .then((history: Message[]) => setMessages(history))
      .catch(() => {})

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_URL}/ws?token=${token}`),
      reconnectDelay: 5000,
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
    })

    client.onConnect = () => {
      setConnected(true)
      client.subscribe('/topic/messages', (frame) => {
        const msg: Message = JSON.parse(frame.body)
        setMessages(prev => [...prev, msg])
      })
    }

    client.activate()
    clientRef.current = client

    return () => { client.deactivate() }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send() {
    const text = input.trim()
    if (!text || !clientRef.current?.connected) return
    clientRef.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ content: text }),
    })
    setInput('')
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  function formatTime(iso: string) {
    const d = new Date(iso)
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  function formatDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
  }

  let lastDate = ''

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-950">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-800 bg-gray-900/60 backdrop-blur">
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white">
            은새
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 ${connected ? 'bg-green-400' : 'bg-gray-500'}`} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">은새네 가족 채팅</p>
          <p className="text-xs text-gray-400">{connected ? '연결됨' : '연결 중...'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.map((msg, i) => {
          const isMine = msg.senderEmail === myEmail
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
                    {getDisplayName(myEmail)[0]}
                  </div>
                )}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-800 bg-gray-900/60 backdrop-blur">
        <div className="flex gap-2 max-w-3xl mx-auto">
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
            disabled={!connected || !input.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl transition-colors text-sm font-medium"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  )
}
