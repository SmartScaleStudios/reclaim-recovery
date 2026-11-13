const $=id=>document.getElementById(id);
const blank={plan:{name:"",startDate:"",dailyCost:0,goal:"",reasons:"",triggers:"",support:"",ifThen:""},cravings:[],journal:[],checkins:[]};
let state=structuredClone(blank),selectedMood="",breathTimer=null;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=n=>new Intl.NumberFormat(undefined,{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n||0);
function msg(id,t){$(id).textContent=t}
const DATA_KEY = "reclaim_local_recovery_data";
function saveState(){localStorage.setItem(DATA_KEY,JSON.stringify(state));renderAll()}
function loadLocal(){
  try{
    let saved=JSON.parse(localStorage.getItem(DATA_KEY)||"null");
    // One-time migration from the previous local-account prototype:
    // copy the first local admin's recovery record into the new single-profile store.
    if(!saved){
      const accounts=JSON.parse(localStorage.getItem("reclaim_local_accounts_v1")||"[]");
      const admin=accounts.find(a=>a.role==="admin")||accounts[0];
      if(admin){
        saved=JSON.parse(localStorage.getItem("reclaim_data_"+admin.id)||"null");
        if(saved)localStorage.setItem(DATA_KEY,JSON.stringify(saved));
      }
    }
    state=saved?{...structuredClone(blank),...saved}:structuredClone(blank);
  }catch{state=structuredClone(blank)}
  renderPlan();renderAll()
}
function toast(t){const el=$("toast")||document.createElement("div");el.textContent=t;el.className="toast";document.body.append(el);setTimeout(()=>el.remove(),2400)}
function days(){if(!state.plan.startDate)return 0;return Math.max(0,Math.floor((Date.now()-new Date(state.plan.startDate+"T00:00:00").getTime())/86400000)+1)}
function renderAll(){const d=days(),p=state.plan;$("streakValue").textContent=d+" "+(d===1?"day":"days");$("streakSub").textContent=p.startDate?"Since "+new Date(p.startDate+"T00:00:00").toLocaleDateString():"Set a recovery start date in your plan.";$("savedValue").textContent=money(Math.max(0,d-1)*(Number(p.dailyCost)||0));$("cravingCount").textContent=state.cravings.length;const next=[1,7,30,90].find(x=>d<x)||"90+";$("milestoneValue").textContent=typeof next==="number"?"Day "+next:next+" days";$("milestoneSub").textContent=typeof next==="number"?Math.max(0,next-d)+" days to next milestone":"Milestone reached";$("ringDays").textContent=d;$("progressRing").style.background=`conic-gradient(var(--green) ${Math.min(100,d/90*100)*3.6}deg,#263932 0deg)`;$("progressHeading").textContent=d?`${d} days of showing up.`:"Your story starts here.";$("progressText").textContent=p.reasons||"Add your reasons in your recovery plan. A lapse does not erase your progress.";[1,7,30,90].forEach(n=>{$("m"+n).textContent=(d>=n?"✓ ":"○ ")+n+" days";});$("whyText").textContent=p.reasons||"Add your reasons in your recovery plan.";
$("cravingList").innerHTML=state.cravings.length?state.cravings.slice(0,40).map(c=>`<div class="entry-item"><b>${esc(c.type)} · ${c.intensity}/10</b><br><small>${new Date(c.date).toLocaleString()} · ${esc(c.trigger)}</small>${c.context?`<p>${esc(c.context)}</p>`:""}${c.response?`<p>Helpful response: ${esc(c.response)}</p>`:""}</div>`).join(""):'<p class="muted">No craving entries yet.</p>';
$("journalList").innerHTML=state.journal.length?state.journal.slice(0,40).map(j=>`<div class="entry-item"><b>${esc(j.mood)}</b> · <small>${new Date(j.date).toLocaleString()}</small><p>${esc(j.prompt)}<br>${esc(j.text)}</p></div>`).join(""):'<p class="muted">No reflections yet.</p>';
const list=state.cravings,counts={};list.forEach(c=>counts[c.trigger]=(counts[c.trigger]||0)+1);const sorted=Object.entries(counts).sort((a,b)=>b[1]-a[1]);$("insightTotal").textContent=list.length;$("avgIntensity").textContent=list.length?(list.reduce((a,c)=>a+c.intensity,0)/list.length).toFixed(1):"—";$("topTrigger").textContent=sorted[0]?.[0]||"—";$("triggerBreakdown").innerHTML=sorted.map(([k,v])=>`<p>${esc(k)} — ${v}</p>`).join("")||'<p class="muted">No data yet.</p>';$("intensityChart").innerHTML=list.slice(0,8).reverse().map(c=>`<div class="bar" title="${c.intensity}/10" style="height:${c.intensity*10}%"></div>`).join("")||'<p class="muted">Log cravings to see trends.</p>';
}
function renderPlan(){const p=state.plan;for(const [id,k] of [["planName","name"],["startDate","startDate"],["dailyCost","dailyCost"],["goal","goal"],["reasons","reasons"],["triggersPlan","triggers"],["supportPlan","support"],["ifThen","ifThen"]])$(id).value=p[k]??""}
function showView(name){document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id==="view-"+name));document.querySelectorAll("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===name));const labels={dashboard:"Overview",cravings:"Craving tracker",emergency:"Urge support",journal:"Journal",insights:"Insights",plan:"Recovery plan",settings:"Settings"};$("pageTitle").textContent=labels[name]||"Overview";$("sidebar").classList.remove("open")}
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.go)));$("menuBtn").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
$("todayLabel").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"}).toUpperCase();
$("intensity").addEventListener("input",e=>msg("intensityValue",e.target.value+" / 10"));
$("cravingForm").addEventListener("submit",async e=>{e.preventDefault();state.cravings.unshift({date:new Date().toISOString(),type:$("cravingType").value,intensity:Number($("intensity").value),trigger:$("trigger").value,context:$("cravingContext").value.trim(),response:$("cravingResponse").value.trim()});saveState();e.target.reset();$("intensity").value=5;msg("intensityValue","5 / 10");msg("cravingStatus","Saved to your account.")});
document.querySelectorAll("#moodOptions button").forEach(b=>b.addEventListener("click",()=>{selectedMood=b.dataset.mood;document.querySelectorAll("#moodOptions button").forEach(x=>x.classList.toggle("selected",x===b))}));
$("saveCheckin").addEventListener("click",async()=>{if(!selectedMood){msg("checkinStatus","Choose a mood first.");return}state.checkins.unshift({date:new Date().toISOString(),mood:selectedMood,note:$("checkinNote").value.trim()});saveState();$("checkinNote").value="";msg("checkinStatus","Check-in saved to your account.")});
$("journalForm").addEventListener("submit",async e=>{e.preventDefault();state.journal.unshift({date:new Date().toISOString(),mood:$("journalMood").value,prompt:$("journalPrompt").value,text:$("journalText").value.trim()});saveState();$("journalText").value="";msg("journalStatus","Reflection saved to your account.")});
$("planForm").addEventListener("submit",async e=>{e.preventDefault();state.plan={name:$("planName").value.trim(),startDate:$("startDate").value,dailyCost:Number($("dailyCost").value)||0,goal:$("goal").value.trim(),reasons:$("reasons").value.trim(),triggers:$("triggersPlan").value.trim(),support:$("supportPlan").value.trim(),ifThen:$("ifThen").value.trim()};saveState();msg("planStatus","Recovery plan saved to your account.")});
document.querySelectorAll(".action-option").forEach(b=>b.addEventListener("click",()=>b.classList.toggle("chosen")));
$("breathStart").addEventListener("click",()=>{if(breathTimer)clearInterval(breathTimer);let n=60;$("breathStart").disabled=true;breathTimer=setInterval(()=>{n--;const phase=(60-n)%10;$("breathCircle").textContent=phase<4?"Breathe in":"Breathe out";$("breathCircle").className="breath-circle "+(phase<4?"inhale":"exhale");$("breathTimer").textContent="00:"+String(n).padStart(2,"0");if(n<=0){clearInterval(breathTimer);breathTimer=null;$("breathCircle").textContent="Well done";$("breathStart").disabled=false;$("breathStart").textContent="Start again"}},1000)});
$("exportBtn").addEventListener("click",()=>{const a=document.createElement("a"),u=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:"application/json"}));a.href=u;a.download="reclaim-backup.json";a.click();URL.revokeObjectURL(u)});
$("importFile").addEventListener("change",async e=>{try{const data=JSON.parse(await e.target.files[0].text());if(!data.plan||!Array.isArray(data.cravings)||!Array.isArray(data.journal))throw Error();state={...structuredClone(blank),...data};saveState();renderPlan();msg("settingsStatus","Backup imported.")}catch{msg("settingsStatus","Invalid backup file.")}e.target.value=""});
$("clearBtn").addEventListener("click",async()=>{if(confirm("Delete all recovery information saved to your account? This cannot be undone.")){state=structuredClone(blank);saveState();renderPlan();msg("settingsStatus","Your recovery data was cleared.")}});

// Hidden admin shortcut: click the RECLAIM logo five times within 3 seconds.
(function setupHiddenAdminShortcut(){
  const logo = document.querySelector(".brand");
  if (!logo) return;
  let clicks = 0;
  let resetTimer;
  logo.title = "RECLAIM";
  logo.setAttribute("aria-label", "RECLAIM home");
  logo.addEventListener("click", (event) => {
    event.preventDefault();
    clicks += 1;
    clearTimeout(resetTimer);
    if (clicks >= 5) {
      clicks = 0;
      location.href = "./reclaim-control-room-7f3a9c.html";
      return;
    }
    resetTimer = setTimeout(() => { clicks = 0; }, 3000);
  });
})();

loadLocal();
if("serviceWorker"in navigator&&location.protocol!=="file:")window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(console.warn));
