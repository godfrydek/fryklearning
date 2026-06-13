(function(){
  const PUBLIC = ["index.html","login.html","signup.html","pending.html"];
  const page = location.pathname.split("/").pop() || "index.html";
  if(PUBLIC.includes(page)) return;

  const CURRENT_KEY = "fl_current_user_banger_v1";
  const TIMEOUT_MS = 30 * 60 * 1000;

  try{
    const me = JSON.parse(localStorage.getItem(CURRENT_KEY));
    const last = Number(me && (me.lastSeen || me.loggedAt || 0));
    if(me && me.status === "approved" && last && Date.now() - last <= TIMEOUT_MS){
      me.lastSeen = Date.now();
      localStorage.setItem(CURRENT_KEY, JSON.stringify(me));
      try{ sessionStorage.setItem(CURRENT_KEY, JSON.stringify(me)); }catch(e){}
      return;
    }
  }catch(e){}

  localStorage.removeItem(CURRENT_KEY);
  try{ sessionStorage.removeItem(CURRENT_KEY); }catch(e){}
  location.replace("login.html?locked=1&v=finalsell1781348453");
})();
