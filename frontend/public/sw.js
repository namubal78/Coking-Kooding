const CACHE = 'ck-v2'
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
self.addEventListener('push', e => {
  let data = { title: 'CokingCooding', body: '새 메시지가 있습니다' }
  try { data = e.data?.json() ?? data } catch {}

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/main.png',
      badge: '/favicon.ico',
      tag: 'chat-message',
      renotify: true,
      data: { url: '/world/chat' },
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
