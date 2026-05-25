self.addEventListener('push', function(e){
  var data = e.data ? e.data.json() : {};
  var title = data.title || '애니콜택시';
  var body = data.body || '새 알림이 있어요!';
  var badge = data.badge || 1;
  e.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: '/icon-192.png',
      badge: '/icon-72.png',
      tag: 'anicall-push',
      renotify: true,
      data: { url: '/admin-mobile.html' }
    })
  );
  // 배지 표시
  if(navigator.setAppBadge) navigator.setAppBadge(badge);
});

self.addEventListener('notificationclick', function(e){
  e.notification.close();
  e.waitUntil(
    clients.openWindow(e.notification.data.url || '/admin-mobile.html')
  );
});

self.addEventListener('message', function(e){
  if(e.data && e.data.type === 'CLEAR_BADGE'){
    if(navigator.clearAppBadge) navigator.clearAppBadge();
  }
});
