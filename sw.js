const cacheName='chronoflow-v2';
const assets=['./','./index.html','./manifest.json','./icon.png','./sw.js'];

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(cacheName).then(c=>{
      return Promise.allSettled(assets.map(a=>c.add(a)));
    })
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
      const fetchPromise=fetch(e.request).then(res=>{
        if(res&&res.status===200&&res.type==='basic'){
          const clone=res.clone();
          caches.open(cacheName).then(c=>c.put(e.request,clone));
        }
        return res;
      }).catch(()=>null);
      return cached||fetchPromise;
    })
  );
});

self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({type:'window',includeUncontrolled:true}).then(clients=>{
      const focused=clients.find(c=>c.focused);
      if(focused)return focused.focus();
      if(clients.length>0)return clients[0].focus();
      return self.clients.openWindow('./');
    })
  );
});

self.addEventListener('notificationclose',e=>{});
