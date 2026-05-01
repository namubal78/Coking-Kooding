'use client'

import { useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import Navbar from '@/components/Navbar'
import { API_URL, apiFetch, getToken, parseJwt, getDisplayName } from '@/lib/api'

interface Message {
  id: number
  senderEmail: string
  senderName: string
  content: string | null
  imageUrl: string | null
  createdAt: string
}

type Reads = Record<string, number>  // email → lastReadId

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [reads, setReads] = useState<Reads>({})
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const [myEmail, setMyEmail] = useState('')
  const [pendingImage, setPendingImage] = useState<{ file: File; url: string } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const clientRef = useRef<Client | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const token = getToken()
    if (!token) return

    const payload = parseJwt(token)
    const email = payload?.sub ?? ''
    if (email) setMyEmail(email)

    // 히스토리 + 읽음 상태 로드
    apiFetch('/api/messenger/history')
      .then(r => r.json())
      .then((data: { messages: Message[]; reads: Reads }) => {
        setMessages(data.messages)
        setReads(data.reads)
        // 마지막 메시지 읽음 처리
        if (data.messages.length > 0) {
          const lastId = data.messages[data.messages.length - 1].id
          markRead(email, lastId)
        }
      })
      .catch(() => {})

    // PWA 배지 제거 (채팅 열면 읽음 처리)
    if ('clearAppBadge' in navigator) navigator.clearAppBadge?.()

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_URL}/ws?token=${token}`),
      reconnectDelay: 5000,
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
    })

    client.onConnect = () => {
      setConnected(true)

      client.subscribe('/topic/messages', (frame) => {
        const msg: Message = JSON.parse(frame.body)
        setMessages(prev => {
          const updated = [...prev, msg]
          // 새 메시지 도착 → 자동 읽음 처리
          markRead(email, msg.id)
          return updated
        })
      })

      client.subscribe('/topic/reads', (frame) => {
        const { email: e, lastReadId }: { email: string; lastReadId: number } = JSON.parse(frame.body)
        setReads(prev => ({ ...prev, [e]: lastReadId }))
      })
    }

    client.activate()
    clientRef.current = client
    return () => { client.deactivate() }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function markRead(email: string, lastId: number) {
    apiFetch('/api/messenger/read', {
      method: 'POST',
      body: JSON.stringify({ lastId }),
    }).then(() => {
      window.dispatchEvent(new Event('messagesRead'))
    }).catch(() => {})
  }

  // 메시지를 보낸 내 입장에서 상대방이 아직 읽지 않은 수
  function unreadCount(msgId: number, senderEmail: string): number {
    if (senderEmail !== myEmail) return 0
    return Object.entries(reads).filter(
      ([email, lastId]) => email !== senderEmail && lastId < msgId
    ).length
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const objectUrl = URL.createObjectURL(file)
    setPendingImage({ file, url: objectUrl })
    e.target.value = ''
  }

  async function send() {
    if (!clientRef.current?.connected) return

    let imageUrl: string | null = null

    if (pendingImage) {
      setUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', pendingImage.file)
        const res = await fetch(`${API_URL}/api/messenger/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${getToken()}` },
          body: formData,
        })
        const data = await res.json()
        imageUrl = data.url
      } catch {
        setUploading(false)
        return
      }
      setUploading(false)
      URL.revokeObjectURL(pendingImage.url)
      setPendingImage(null)
    }

    const text = input.trim()
    if (!text && !imageUrl) return

    clientRef.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ content: text || null, imageUrl }),
    })
    setInput('')
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }
  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
  }

  let lastDate = ''

  return (
    <>
      <Navbar />
      {/* 이미지 라이트박스 */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} className="max-w-full max-h-full rounded-lg object-contain" />
        </div>
      )}

      <div className="chat-area">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-900/60 backdrop-blur shrink-0">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white">은새</div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 ${connected ? 'bg-green-400' : 'bg-gray-500'}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">은새네 가족 채팅</p>
            <p className="text-xs text-gray-400">{connected ? '연결됨' : '연결 중...'}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {messages.map((msg, i) => {
            const isMine = msg.senderEmail === myEmail
            const msgDate = new Date(msg.createdAt).toDateString()
            const showDate = msgDate !== lastDate
            if (showDate) lastDate = msgDate
            const prevMsg = messages[i - 1]
            const showSender = !isMine && (!prevMsg || prevMsg.senderEmail !== msg.senderEmail)
            const unread = unreadCount(msg.id, msg.senderEmail)

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">{formatDate(msg.createdAt)}</span>
                  </div>
                )}
                <div className={`flex items-end gap-1.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                  {!isMine && (
                    <div className="w-7 h-7 rounded-full bg-purple-700 flex-shrink-0 flex items-center justify-center text-xs text-white font-bold mb-0.5">
                      {msg.senderName[0]}
                    </div>
                  )}

                  <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[72%]`}>
                    {showSender && <span className="text-xs text-gray-400 mb-1 ml-1">{msg.senderName}</span>}

                    {/* 이미지 */}
                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        onClick={() => setLightbox(msg.imageUrl!)}
                        className="max-w-[200px] rounded-xl mb-1 cursor-pointer hover:opacity-90 transition-opacity"
                      />
                    )}

                    {/* 텍스트 */}
                    {msg.content && (
                      <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                        isMine ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-gray-800 text-gray-100 rounded-bl-sm'
                      }`}>
                        {msg.content}
                      </div>
                    )}

                    <div className={`flex items-center gap-1 mt-0.5 mx-1 ${isMine ? 'flex-row-reverse' : ''}`}>
                      {/* 읽음 카운트 */}
                      {isMine && unread > 0 && (
                        <span className="text-[10px] text-amber-400 font-semibold">{unread}</span>
                      )}
                      <span className="text-[10px] text-gray-600">{formatTime(msg.createdAt)}</span>
                    </div>
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

        {/* Image preview */}
        {pendingImage && (
          <div className="px-4 pt-2 shrink-0">
            <div className="relative inline-block">
              <img src={pendingImage.url} className="h-20 rounded-lg object-cover" />
              <button
                onClick={() => { URL.revokeObjectURL(pendingImage.url); setPendingImage(null) }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 rounded-full text-xs text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              >✕</button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-3 py-3 border-t border-gray-800 bg-gray-900/60 backdrop-blur shrink-0">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          <div className="flex gap-2 max-w-3xl mx-auto items-end">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border border-gray-700 text-gray-400 hover:text-indigo-400 hover:border-indigo-700 transition-colors disabled:opacity-40"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={pendingImage ? '이미지에 메시지 추가 (선택)' : '메시지를 입력하세요...'}
              rows={1}
              className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-2.5 resize-none outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500 leading-relaxed"
              style={{ minHeight: '42px', maxHeight: '120px', fontSize: '16px' }}
            />
            <button
              onClick={send}
              disabled={!connected || uploading || (!input.trim() && !pendingImage)}
              className="flex-shrink-0 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl transition-colors text-sm font-medium"
            >
              {uploading ? '...' : '전송'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
