const $=id=>document.getElementById(id);
const ACCOUNTS_KEY="reclaim_local_accounts_v1";
const accounts=()=>{try{return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)||"[]")}catch{return[]}};
const session=localStorage.getItem("reclaim_local_session_v1");
const current=accounts().find(a=>a.id===session);
const deny=()=>{$("denied").hidden=false;$("dashboard").hidden=true};
$("adminLogout").addEventListener("click",()=>{localStorage.removeItem("reclaim_local_session_v1");location.href="index.html"});
function getAllLocalRecoveryData(){
  const all=[];
  for(const account of accounts()){
    try{
      const data=JSON.parse(localStorage.getItem("reclaim_data_"+account.id)||"null");
      if(data)all.push(data);
    }catch{}
  }
  // Also include the original single-profile storage key if present.
  try{
    const legacy=JSON.parse(localStorage.getItem("reclaim_data")||"null");
    if(legacy)all.push(legacy);
  }catch{}
  return all;
}
function barRows(target,items,empty){
  const entries=Object.entries(items).sort((a,b)=>b[1]-a[1]).slice(0,7);
  if(!entries.length){$(target).innerHTML=`<p class="muted">${empty}</p>`;return;}
  const max=Math.max(...entries.map(x=>x[1]),1);
  $(target).innerHTML=entries.map(([label,value])=>`<div class="bar-row"><div class="bar-label"><span>${escapeHtml(label||"Unspecified")}</span><b>${value}</b></div><div class="bar-track"><i style="width:${Math.max(4,value/max*100)}%"></i></div></div>`).join("");
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function render(){
 const datasets=getAllLocalRecoveryData();
 const cravings=datasets.flatMap(d=>Array.isArray(d.cravings)?d.cravings:[]);
 const checkins=datasets.flatMap(d=>Array.isArray(d.checkins)?d.checkins:[]);
 const journals=datasets.flatMap(d=>Array.isArray(d.journal)?d.journal:[]);
 const now=Date.now(),within=(x,days)=>{const t=new Date(x).getTime();return Number.isFinite(t)&&now-t>=0&&now-t<=days*86400000};
 $("cravingTotal").textContent=cravings.length;
 $("checkinTotal").textContent=checkins.length;
 $("journalTotal").textContent=journals.length;
 $("avgIntensity").textContent=cravings.length?(cravings.reduce((sum,c)=>sum+(Number(c.intensity)||0),0)/cravings.length).toFixed(1)+"/10":"—";
 $("weekCravings").textContent=cravings.filter(c=>within(c.date,7)).length;
 $("monthCravings").textContent=cravings.filter(c=>within(c.date,30)).length;
 $("weekCheckins").textContent=checkins.filter(c=>within(c.date,7)).length;
 $("monthCheckins").textContent=checkins.filter(c=>within(c.date,30)).length;
 const triggers={};cravings.forEach(c=>{const k=c.trigger||"Unspecified";triggers[k]=(triggers[k]||0)+1});
 const moods={};checkins.forEach(c=>{const k=c.mood||"Unspecified";moods[k]=(moods[k]||0)+1});
 barRows("triggerBars",triggers,"No craving data yet.");
 barRows("moodBars",moods,"No mood check-in data yet.");
 const bytes=new Blob(Object.keys(localStorage).map(k=>k+localStorage.getItem(k))).size;
 $("storageUsage").textContent=`Approximate local storage used by this website: ${(bytes/1024).toFixed(1)} KB`;
 $("lastUpdated").textContent="Dashboard refreshed: "+new Date().toLocaleString();
}
if(!current||current.role!=="admin"){deny();}
else{$("adminIdentity").textContent="Signed in as local administrator";$("dashboard").hidden=false;render();}
$("refresh").addEventListener("click",render);
