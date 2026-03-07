// Service Worker：网络优先策略，网络失败时回退到缓存

const CACHE_NAME = 'taskforge-v1';

// 安装时预缓存应用 Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(['/', '/manifest.json'])
    )
  );
  self.skipWaiting();
});

// 激活时清理旧版本缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 拦截请求：网络优先，网络失败时用缓存
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求；API 请求不缓存
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 网络成功：更新缓存并返回响应
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() =>
        // 网络失败：从缓存取
        caches.match(event.request).then((cached) => cached ?? Response.error())
      )
  );
});
