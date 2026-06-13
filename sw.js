const CACHE='fryk-learning-finalsell1781348453';
const CORE=['./index.html','./style.css','./auth.js','./secure.js','./guard.js','./login.html','./test.html','./anglictina.html','./matika.html','./cestina.html','./dashboard.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).catch(()=>null));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));});
self.addEventListener('fetch',e=>{ if(e.request.method!=='GET') return; e.respondWith(fetch(e.request).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html')))); });
