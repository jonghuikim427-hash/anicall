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
    }).then(function(){
      if(self.registration.setAppBadge) return self.registration.setAppBadge(badge);
    })
  );
});

self.addEventListener('notificationclick', function(e){
  e.notification.close();
  if(self.registration.clearAppBadge) self.registration.clearAppBadge();
  e.waitUntil(
    clients.matchAll({type:'window', includeUncontrolled:true}).then(function(cls){
      var url = e.notification.data.url || '/admin-mobile.html';
      for(var i=0;i<cls.length;i++){
        if(cls[i].url.indexOf('admin-mobile')>-1) return cls[i].focus();
      }
      return clients.openWindow(url);
    })
  );
});

self.addEventListener('message', function(e){
  if(e.data && e.data.type === 'CLEAR_BADGE'){
    if(self.registration.clearAppBadge) self.registration.clearAppBadge();
    self.registration.getNotifications().then(function(notifications){
      notifications.forEach(function(n){ n.close(); });
    });
  }
});
