const $ = id => document.getElementById(id);
const authPanel = $("authPanel"), appShell = $("appShell");
const status = $("authStatus");
const ACCOUNTS_KEY = "reclaim_local_accounts_v1";
const SESSION_KEY = "reclaim_local_session_v1";
let mode = "signup";

const readAccounts = () => {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]"); }
  catch { return []; }
};
const writeAccounts = accounts => localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
const bytesToHex = bytes => [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2,"0")).join("");
async function hashPassword(password, saltHex) {
  if (!crypto.subtle) throw new Error("Password protection requires a secure browser connection. Open RECLAIM using its HTTPS GitHub Pages address.");
  const salt = saltHex ? new Uint8Array(saltHex.match(/.{2}/g).map(x=>parseInt(x,16))) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({name:"PBKDF2",salt,iterations:310000,hash:"SHA-256"},key,256);
  return {salt:bytesToHex(salt),hash:bytesToHex(bits)};
}
function message(text,bad=false){status.textContent=text;status.className="auth-status"+(bad?" error":"");}
function showMode(next){
  mode=next;
  $("authTitle").textContent=next==="signup"?"Create your RECLAIM account":"Welcome back";
  $("authSubtitle").textContent=next==="signup"?"Create a private recovery space on this device.":"Sign in to open your local recovery space.";
  $("authSubmit").textContent=next==="signup"?"Create account":"Log in";
  $("authNameWrap").hidden=next!=="signup";
  $("authConfirmWrap").hidden=next!=="signup";
  $("authLinks").hidden=false;
  $("showReset").hidden=true;
  $("authPassword").required=true;
  $("authConfirm").required=next==="signup";
  message("");
}
$("showSignup").addEventListener("click",()=>showMode("signup"));
$("showLogin").addEventListener("click",()=>showMode("login"));
$("authForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const username=$("authEmail").value.trim().toLowerCase();
  const password=$("authPassword").value;
  $("authSubmit").disabled=true;message("Please wait…");
  try{
    if(username.length<3)throw new Error("Use at least 3 characters for your email or username.");
    if(password.length<8)throw new Error("Use a password with at least 8 characters.");
    const accounts=readAccounts();
    if(mode==="signup"){
      if(accounts.some(a=>a.username===username))throw new Error("An account with that email or username already exists.");
      if(password!==$("authConfirm").value)throw new Error("Your passwords do not match.");
      const credential=await hashPassword(password);
      const firstAccount=accounts.length===0;
      const user={id:crypto.randomUUID(),username,displayName:$("authName").value.trim()||username,role:firstAccount?"admin":"user",createdAt:new Date().toISOString(),...credential};
      accounts.push(user);writeAccounts(accounts);
      localStorage.setItem(SESSION_KEY,user.id);
      message(firstAccount?"Your account is ready. You are the first local administrator.":"Your account is ready. Opening your recovery space…");
      enterApp(user);
    }else{
      const user=accounts.find(a=>a.username===username);
      if(!user)throw new Error("We couldn't find an account with those details.");
      const candidate=await hashPassword(password,user.salt);
      if(candidate.hash!==user.hash)throw new Error("The password is incorrect.");
      localStorage.setItem(SESSION_KEY,user.id);
      enterApp(user);
    }
  }catch(err){message(err.message||"Something went wrong. Please try again.",true);}
  finally{$("authSubmit").disabled=false;}
});
function enterApp(user){
  if(!user){appShell.hidden=true;authPanel.hidden=false;return;}
  authPanel.hidden=true;appShell.hidden=false;
  $("signedInEmail").textContent=user.displayName||user.username;
  const note=document.querySelector(".privacy-note");if(note)note.textContent="● Stored only in this browser.";
  let adminLink=document.getElementById("localAdminLink");
  if(user.role==="admin"&&!adminLink){
    adminLink=document.createElement("a");adminLink.id="localAdminLink";adminLink.className="nav-link";adminLink.href="admin.html";adminLink.textContent="▦ Admin console";
    $("sidebar").querySelector(".nav").append(adminLink);
  }else if(user.role!=="admin"&&adminLink){adminLink.remove();}
  window.dispatchEvent(new CustomEvent("reclaim:authenticated",{detail:{user}}));
}
$("logoutBtn").addEventListener("click",()=>{localStorage.removeItem(SESSION_KEY);userIdReset();enterApp(null);showMode("login");});
function userIdReset(){window.dispatchEvent(new CustomEvent("reclaim:loggedout"));}
const currentId=localStorage.getItem(SESSION_KEY);
if(currentId){const user=readAccounts().find(a=>a.id===currentId);if(user)enterApp(user);else localStorage.removeItem(SESSION_KEY);}
if(authPanel.hidden===false)showMode(readAccounts().length?"login":"signup");
