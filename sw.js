const cacheName='chronoflow-v1';
const assets=['./','./index.html','./manifest.json','./icon.png','./logo.png'];

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(cacheName).then(c=>c.addAll(assets.filter(Boolean))).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==cacheName).map(k=>caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached)return cached;
      return fetch(e.request).then(res=>{
        if(res&&res.status===200){
          const clone=res.clone();
          caches.open(cacheName).then(c=>c.put(e.request,clone));
        }
        return res;
      }).catch(()=>cached);
    })
  );
});

self.addEventListener('message',e=>{
  if(!e.data)return;
  if(e.data.type==='TIMER_DONE'){
    const title=e.data.label||'ChronoFlow';
    const body=e.data.body||'Timer finished!';
    self.registration.showNotification(title,{
      body,
      icon:'./icon.png',
      badge:'./icon.png',
      tag:'chronoflow-timer',
      renotify:true,
      requireInteraction:true,
      vibrate:[200,100,200,100,400],
      actions:[{action:'dismiss',title:'Dismiss'}]
    });
  }
  if(e.data.type==='SKIP_WAITING')self.skipWaiting();
});

self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({type:'window',includeUncontrolled:true}).then(clients=>{
      if(clients.length>0)return clients[0].focus();
      return self.clients.openWindow('./');
    })
  );
});
