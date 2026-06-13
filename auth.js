(function(){
  const BUILD = "finalsell1781348453";
  const USERS = [{"aliasHash":"4c1029697ee358715d3a14a2add817c4b01651440de808371f78165ac90dc581","salt":"cYfRJkIxUyCm","passHash":"f1f18354622403dacf5164b08dfc90bec73d7873fb0ab22634d8bb0b497f78b7","name":"Owner","role":"admin","status":"approved"},{"aliasHash":"84983c60f7daadc1cb8698621f802c0d9f9a3c3c295c810748fb048115c186ec","salt":"NH8CeFXrxQu8","passHash":"63db64cc66076944d140edd8e75668d48f6072b48edab6db9fd8fcf9beb0540a","name":"Guest","role":"guest","status":"approved"}];
  const CURRENT_KEY = "fl_current_user_banger_v1";
  const PROGRESS_KEY = "fl_progress_banger_v1";
  const SETTINGS_KEY = "fl_settings_banger_v1";
  const PUBLIC = ["index.html","login.html","signup.html","pending.html"];

  async function sha256(text){
    const data = new TextEncoder().encode(String(text));
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2,"0")).join("");
  }

  function page(){ return location.pathname.split("/").pop() || "index.html"; }

  const TIMEOUT_MS = 30 * 60 * 1000;

  function clearCurrent(){
    localStorage.removeItem(CURRENT_KEY);
    try{ sessionStorage.removeItem(CURRENT_KEY); }catch(e){}
  }

  function current(){
    try{
      const me = JSON.parse(localStorage.getItem(CURRENT_KEY));
      if(!me) return null;
      const last = Number(me.lastSeen || me.loggedAt || 0);
      if(!last || Date.now() - last > TIMEOUT_MS){
        clearCurrent();
        return null;
      }
      return me;
    }catch(e){ return null; }
  }

  function touchSession(){
    const me = current();
    if(!me) return null;
    me.lastSeen = Date.now();
    localStorage.setItem(CURRENT_KEY, JSON.stringify(me));
    try{ sessionStorage.setItem(CURRENT_KEY, JSON.stringify(me)); }catch(e){}
    return me;
  }

  function setCurrent(u){
    u.lastSeen = Date.now();
    localStorage.setItem(CURRENT_KEY, JSON.stringify(u));
    try{ sessionStorage.setItem(CURRENT_KEY, JSON.stringify(u)); }catch(e){}
    refreshNav();
  }

  function logout(){
    clearCurrent();
    location.href = "login.html?v=finalsell1781348453min1781205374";
  }

  async function login(alias,password){
    const a = String(alias||"").trim().toLowerCase();
    const p = String(password||"");
    const ah = await sha256(a);
    const u = USERS.find(x => x.aliasHash === ah);
    if(!u) return {ok:false,message:"Špatný login nebo heslo.", debug:"alias", build:BUILD};
    const ph = await sha256(a+":"+p+":"+u.salt);
    if(ph !== u.passHash) return {ok:false,message:"Špatný login nebo heslo.", debug:"password", build:BUILD};
    setCurrent({name:u.name,role:u.role,status:u.status,aliasHash:u.aliasHash,build:BUILD,loggedAt:Date.now()});
    return {ok:true,user:u,build:BUILD};
  }

  function requireLogin(){
    if(PUBLIC.includes(page())) return true;
    const me = current();
    if(!me || me.status !== "approved"){
      location.replace("login.html?locked=1&v=finalsell1781348453");
      return false;
    }
    return true;
  }

  function refreshNav(){
    const me = current();
    document.querySelectorAll(".auth-link").forEach(a => {
      if(me){
        a.textContent = me.role === "admin" ? "Admin" : "Profil";
        a.href = me.role === "admin" ? "admin.html?v=finalsell1781348453" : "profile.html?v=finalsell1781348453";
      } else {
        a.textContent = "Login";
        a.href = "login.html?v=finalsell1781348453";
      }
    });
  }

  function readStore(k,f){ try{return JSON.parse(localStorage.getItem(k)) ?? f;}catch(e){return f;} }
  function writeStore(k,v){ localStorage.setItem(k,JSON.stringify(v)); }
  function progress(){ return readStore(PROGRESS_KEY,[]); }

  function recordTest(result){
    const me = current();
    const row = {
      user: me?.aliasHash || "session",
      name: me?.name || "User",
      topic: result.topic || "Téma",
      key: result.key || "",
      score: result.score || 0,
      total: result.total || 0,
      pct: result.pct || 0,
      xp: result.xp || 0,
      at: new Date().toISOString()
    };
    const all = progress();
    all.unshift(row);
    writeStore(PROGRESS_KEY, all.slice(0,250));
  }

  function summary(){
    const me = current();
    const rows = progress().filter(r=>!me || r.user===me.aliasHash);
    const tests = rows.length;
    const xp = rows.reduce((a,b)=>a+(Number(b.xp)||0),0);
    const avg = tests?Math.round(rows.reduce((a,b)=>a+(Number(b.pct)||0),0)/tests):0;
    const best = tests?Math.max(...rows.map(r=>Number(r.pct)||0)):0;
    const last = rows[0] || null;
    const topics = new Set(rows.map(r=>r.topic||r.key).filter(Boolean)).size;
    return {tests,xp,avg,best,last,topics,rows};
  }

  function settings(){ return readStore(SETTINGS_KEY,{}); }
  function saveSettings(s){ writeStore(SETTINGS_KEY,s); location.reload(); }
  function users(){ return USERS.map(u=>({name:u.name,role:u.role,status:u.status})); }

  window.FLAuth = {login,logout,current,users,progress,recordTest,summary,settings,saveSettings,approve:()=>false,reject:()=>false,build:BUILD};
  window.FLSecure = window.FLAuth;

  document.addEventListener("DOMContentLoaded",()=>{
    refreshNav();
    requireLogin();

    ["click","keydown","scroll","touchstart"].forEach(evt => {
      window.addEventListener(evt, () => touchSession(), {passive:true});
    });

    const status = document.getElementById("loginStatus");
    if(status) status.textContent = "Build: " + BUILD + " · app loaded";

    const lockedMsg = document.getElementById("lockedMsg");
    if(lockedMsg && new URLSearchParams(location.search).get("locked")){
      lockedMsg.innerHTML='<div class="locked-note">Obsah je zamčený. Přihlas se pro zobrazení zápisů, testů a dashboardu.</div>';
    }

    const form = document.getElementById("loginForm");
    if(form){
      form.addEventListener("submit", async e => {
        e.preventDefault();
        const fd = new FormData(form);
        const msg = document.getElementById("loginMsg");
        if(msg){msg.textContent="Ověřuji přihlášení...";msg.className="form-msg";}
        const res = await login(fd.get("login"),fd.get("password"));
        if(!res.ok){
          if(msg){msg.textContent=res.message+" ("+res.debug+")";msg.className="form-msg bad";}
          return;
        }
        if(msg){msg.textContent="Přihlášeno, přesměrovávám...";msg.className="form-msg";}
        setTimeout(()=>location.href="dashboard.html?v=finalsell1781348453",120);
      });
    }
  });
})();
