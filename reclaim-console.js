const $=id=>document.getElementById(id);
const KEY="reclaim_local_recovery_data";
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function bars(id,values,empty){
 const rows=Object.entries(values).sort((a,b)=>b[1]-a[1]).slice(0,8);
 if(!rows.length){$(id).innerHTML=`<p class="muted">${empty}</p>`;return;}
 const max=Math.max(1,...rows.map(x=>x[1]));
 $(id).innerHTML=rows.map(([name,n])=>`<div class="bar-row"><div class="bar-label"><span>${escapeHtml(name||"Unspecified")}</span><b>${n}</b></div><div class="bar-track"><i style="width:${Math.max(4,n/max*100)}%"></i></div></div>`).join("");
}
function render(){
 let d={cravings:[],checkins:[],journal:[]};
 try{d={...d,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{}
 const c=d.cravings||[],m=d.checkins||[],j=d.journal||[],now=Date.now();
 const recent=(x,days)=>{const t=new Date(x).getTime();return Number.isFinite(t)&&now-t>=0&&now-t<=days*86400000};
 $("cravingTotal").textContent=c.length;$("checkinTotal").textContent=m.length;$("journalTotal").textContent=j.length;
 $("avgIntensity").textContent=c.length?(c.reduce((s,x)=>s+(Number(x.intensity)||0),0)/c.length).toFixed(1)+"/10":"—";
 $("weekCravings").textContent=c.filter(x=>recent(x.date,7)).length;$("monthCravings").textContent=c.filter(x=>recent(x.date,30)).length;
 $("weekCheckins").textContent=m.filter(x=>recent(x.date,7)).length;$("monthCheckins").textContent=m.filter(x=>recent(x.date,30)).length;
 const triggers={},moods={};c.forEach(x=>{const k=x.trigger||"Unspecified";triggers[k]=(triggers[k]||0)+1});m.forEach(x=>{const k=x.mood||"Unspecified";moods[k]=(moods[k]||0)+1});
 bars("triggerBars",triggers,"No craving logs yet.");bars("moodBars",moods,"No mood check-ins yet.");
 $("storageUsage").textContent=`Approximate website storage: ${(new Blob(Object.keys(localStorage).map(k=>k+localStorage.getItem(k))).size/1024).toFixed(1)} KB`;
 $("lastUpdated").textContent="Last refreshed: "+new Date().toLocaleString();
}
$("refresh").addEventListener("click",render);render();
