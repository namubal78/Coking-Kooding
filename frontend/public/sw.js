const CACHE = 'ck-v4'
const PRECACHE = ['/', '/home', '/blog', '/portfolio', '/demo', '/login']

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  if (!e.request.url.startsWith('http')) return
  if (e.request.url.includes('/api/')) return
  // HTML 페이지는 캐싱 안 하고 항상 네트워크에서 가져옴 (SW 업데이트 즉시 반영)
  if (e.request.mode === 'navigate') return

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return res
      })
      .catch(() => caches.match(e.request))
  )
})

// 웹 푸시 수신 → 알림 표시
// 채팅 페이지에 포커스가 있을 때만 생략, 그 외(다른 페이지·백그라운드)는 항상 표시
self.addEventListener('push', e => {
  let data = { title: 'CokingCooding', body: '새 메시지가 있습니다' }
  try { data = e.data?.json() ?? data } catch {}

  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const chatFocused = list.some(c => c.focused && c.url.includes('/world/chat'))
      if (chatFocused) return  // 채팅 화면 보는 중 → 알림 생략
      return self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/main.png',
        badge: '/favicon.ico',
        tag: 'chat-message',
        renotify: true,
        data: { url: '/world/chat' },
      })
    })
  )
})

// 알림 클릭 → 채팅 페이지 열기
self.addEventListener('notificationclick', e => {
  e.notification.close()
  const target = e.notification.data?.url || '/world/chat'
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes(target) && 'focus' in client) return client.focus()
      }
      return clients.openWindow(target)
    })
  )
})
