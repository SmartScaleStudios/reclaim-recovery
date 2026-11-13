const STORE_KEY = "reclaim-v1";
const blankState = {plan:{name:"",startDate:"",dailyCost:0,goal:"",reasons:"",triggers:"",support:"",ifThen:""},cravings:[],journal:[],checkins:[],lastMood:""};
let state = loadState();
let selectedMood = "";
let breathInterval = null;
let deferredPrompt = null;
const $ = id => document.getElementById(id);
const safe = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function loadState(){try{return {...blankState,...JSON.parse(localStorage.getItem(STORE_KEY)||"{}")}}catch{return structuredClone(blankState)}}
function saveState(){localStorage.setItem(STORE_KEY,JSON.stringify(state));renderAll()}
function toast(msg){const el=$("toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2400)}
function daysSince(date){if(!date)return 0;const start=new Date(date+"T00:00:00");if(Number.isNaN(start.getTime()))return 0;return Math.max(0,Math.floor((new Date().setHours(0,0,0,0)-start.getTime())/86400000)+1)}
function money(n){return new Intl.NumberFormat(undefined,{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n||0)}
function showView(name){document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id==="view-"+name));document.querySelectorAll(".nav-link[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===name));const labels={dashboard:"Overview",cravings:"Craving tracker",emergency:"Urge support",journal:"Journal",insights:"Insights",plan:"Recovery plan",settings:"Settings"};$("pageTitle").textContent=labels[name]||"Overview";$("sidebar").classList.remove("open");window.scrollTo({top:0,behavior:"smooth"});if(name==="insights")renderInsights()}
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.go)));
$("menuBtn").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
$("todayLabel").textContent=new Intl.DateTimeFormat(undefined,{weekday:"long",month:"long",day:"numeric"}).format(new Date()).toUpperCase();

function renderDashboard(){
 const days=daysSince(state.plan.startDate), cost=Number(state.plan.dailyCost)||0;
 $("streakValue").innerHTML=`${days} <small>${days===1?"day":"days"}</small>`;$("streakSub").textContent=days?`Since ${new Date(state.plan.startDate+"T00:00:00").toLocaleDateString()}`:"Set your start date in your recovery plan.";
 $("savedValue").textContent=money(Math.max(0,days-1)*cost);$("cravingCount").textContent=state.cravings.length;
 const milestones=[1,7,30,90], next=milestones.find(x=>days<x)||"∞";$("milestoneValue").textContent=next==="∞"?"90+ days":`Day ${next}`;$("milestoneSub").textContent=next==="∞"?"A major milestone reached":`${Math.max(0,next-days)} days to next milestone`;
 $("ringDays").textContent=days;$("startDateTag").textContent=state.plan.startDate?new Date(state.plan.startDate+"T00:00:00").toLocaleDateString():"Not started";
 const pct=Math.min(100,days/90*100);$("progressRing").style.background=`conic-gradient(var(--green) ${pct*3.6}deg,#263932 0deg)`;
 $("progressHeading").textContent=days?`${days} ${days===1?"day":"days"} of showing up.`:"Your story starts here.";
 $("progressText").textContent=days?`Keep building the life you want, one day and one decision at a time. A lapse never erases the effort you've made.`:"Set a start date in your recovery plan. Progress is personal; a lapse doesn't erase the work you've done.";
 milestones.forEach(n=>{$("m"+n).textContent=days>=n?"✓":"○";$("m"+n).classList.toggle("done",days>=n)});
 $("whyHeading").textContent=state.plan.name?`Why you're changing ${state.plan.name.toLowerCase()}`:"What matters to you beyond the urge?";$("whyText").textContent=state.plan.reasons||"Add your reasons in your Recovery Plan so they're here when you need them.";
}
function renderCravings(){
 $("cravingTotal").textContent=`${state.cravings.length} ${state.cravings.length===1?"entry":"entries"}`;
 $("cravingList").innerHTML=state.cravings.length?state.cravings.slice(0,30).map(c=>`<div class="entry-item"><div class="entry-top"><b>${safe(c.type)} · ${c.intensity}/10</b><small>${new Date(c.date).toLocaleString()}</small></div><small>Trigger: ${safe(c.trigger)}</small>${c.context?`<p>${safe(c.context)}</p>`:""}${c.response?`<p><b>Helpful response:</b> ${safe(c.response)}</p>`:""}</div>`).join(""):'<div class="empty-state">Your entries will appear here. Logging is a way to learn, not a scorecard.</div>';
}
function renderJournal(){$("journalList").innerHTML=state.journal.length?state.journal.slice(0,30).map(j=>`<div class="entry-item"><div class="entry-top"><b>${safe(j.mood)}</b><small>${new Date(j.date).toLocaleString()}</small></div><small>${safe(j.prompt)}</small><p>${safe(j.text)}</p></div>`).join(""):'<div class="empty-state">Your reflections will appear here.</div>'}
function renderInsights(){
 const list=state.cravings,total=list.length,avg=total?list.reduce((a,c)=>a+Number(c.intensity),0)/total:0;$("insightTotal").textContent=total;$("avgIntensity").textContent=total?avg.toFixed(1):"—";
 const counts={};list.forEach(c=>counts[c.trigger]=(counts[c.trigger]||0)+1);const sorted=Object.entries(counts).sort((a,b)=>b[1]-a[1]);$("topTrigger").textContent=sorted[0]?.[0]||"—";
 $("intensityChart").innerHTML=total?list.slice(0,8).reverse().map(c=>`<div class="bar-col"><b>${c.intensity}</b><div class="bar" style="height:${Number(c.intensity)*10}%"></div><small>${new Date(c.date).toLocaleDateString(undefined,{month:"numeric",day:"numeric"})}</small></div>`).join(""):'<div class="empty-state">Log cravings to see your pattern.</div>';
 $("triggerBreakdown").innerHTML=sorted.length?sorted.map(([name,n])=>`<div class="break-row"><span>${safe(name)}</span><b>${n}</b><div class="break-track"><div class="break-fill" style="width:${n/total*100}%"></div></div></div>`).join(""):'<div class="empty-state">Your trigger breakdown will appear here.</div>';
}
function renderPlan(){const p=state.plan;for(const [id,key] of [["planName","name"],["startDate","startDate"],["dailyCost","dailyCost"],["goal","goal"],["reasons","reasons"],["triggersPlan","triggers"],["supportPlan","support"],["ifThen","ifThen"]])$(id).value=p[key]??""}
function renderAll(){renderDashboard();renderCravings();renderJournal();renderInsights()}
$("intensity").addEventListener("input",e=>$("intensityValue").textContent=`${e.target.value} / 10`);
$("cravingForm").addEventListener("submit",e=>{e.preventDefault();state.cravings.unshift({id:crypto.randomUUID(),date:new Date().toISOString(),type:$("cravingType").value,intensity:Number($("intensity").value),trigger:$("trigger").value,context:$("cravingContext").value.trim(),response:$("cravingResponse").value.trim()});saveState();e.target.reset();$("intensity").value=5;$("intensityValue").textContent="5 / 10";$("cravingStatus").textContent="Saved. Thank you for noticing the moment.";toast("Craving log saved.")});
document.querySelectorAll("#moodOptions button").forEach(b=>b.addEventListener("click",()=>{selectedMood=b.dataset.mood;document.querySelectorAll("#moodOptions button").forEach(x=>x.classList.toggle("selected",x===b))}));
$("saveCheckin").addEventListener("click",()=>{if(!selectedMood){$("checkinStatus").textContent="Choose a mood first.";return}state.checkins.unshift({date:new Date().toISOString(),mood:selectedMood,note:$("checkinNote").value.trim()});saveState();$("checkinNote").value="";$("checkinStatus").textContent="Check-in saved. Keep taking care of yourself.";toast("Check-in saved.")});
$("journalForm").addEventListener("submit",e=>{e.preventDefault();state.journal.unshift({date:new Date().toISOString(),mood:$("journalMood").value,prompt:$("journalPrompt").value,text:$("journalText").value.trim()});saveState();$("journalText").value="";$("journalStatus").textContent="Reflection saved.";toast("Reflection saved.")});
$("planForm").addEventListener("submit",e=>{e.preventDefault();state.plan={name:$("planName").value.trim(),startDate:$("startDate").value,dailyCost:Number($("dailyCost").value)||0,goal:$("goal").value.trim(),reasons:$("reasons").value.trim(),triggers:$("triggersPlan").value.trim(),support:$("supportPlan").value.trim(),ifThen:$("ifThen").value.trim()};saveState();$("planStatus").textContent="Your recovery plan has been saved on this device.";toast("Recovery plan saved.")});
document.querySelectorAll(".action-option").forEach(b=>b.addEventListener("click",()=>{b.classList.toggle("chosen");toast(b.classList.contains("chosen")?"Added to your next-step plan.":"Removed from your next-step plan.")}));
$("breathStart").addEventListener("click",()=>{if(breathInterval){clearInterval(breathInterval);breathInterval=null}let remaining=60,phase=0;const phases=[["Breathe in",4,"inhale"],["Breathe out",6,"exhale"]];$("breathStart").textContent="Exercise in progress…";$("breathStart").disabled=true;function tick(){if(remaining<=0){clearInterval(breathInterval);breathInterval=null;$("breathText").textContent="Well done";$("breathTimer").textContent="00:00";$("breathCircle").className="breath-circle";$("breathStart").disabled=false;$("breathStart").textContent="Start again";return}const elapsed=60-remaining,slot=elapsed%10,which=slot<4?0:1;$("breathText").textContent=phases[which][0];$("breathCircle").className="breath-circle "+phases[which][2];$("breathTimer").textContent=`00:${String(remaining).padStart(2,"0")}`;remaining--}tick();breathInterval=setInterval(tick,1000)});
$("exportBtn").addEventListener("click",()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`reclaim-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);$("settingsStatus").textContent="Backup exported."});
$("importFile").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());if(!data.plan||!Array.isArray(data.cravings)||!Array.isArray(data.journal))throw Error("Invalid backup");state={...blankState,...data};saveState();renderPlan();$("settingsStatus").textContent="Backup imported successfully.";toast("Backup imported.")}catch{$("settingsStatus").textContent="Could not import this file. Choose a valid RECLAIM backup."}e.target.value=""});
$("clearBtn").addEventListener("click",()=>{if(confirm("Permanently clear all RECLAIM data saved in this browser? Export a backup first if you may need it.")){state=structuredClone(blankState);localStorage.removeItem(STORE_KEY);renderPlan();renderAll();$("settingsStatus").textContent="Local data cleared.";toast("Local data cleared.")}});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("installBtn").hidden=false});
$("installBtn").addEventListener("click",async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("installBtn").hidden=true});
if("serviceWorker" in navigator && location.protocol!=="file:"){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}))}
renderPlan();renderAll();
