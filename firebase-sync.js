
import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword,
  updatePassword
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  getFirestore, collection, doc, getDoc, getDocs, setDoc, deleteDoc,
  onSnapshot, query, where, writeBatch
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const cfg=window.SPURGO_FIREBASE_CONFIG||{};
const configured=!!(cfg.enabled && cfg.apiKey && !String(cfg.apiKey).startsWith("INSERISCI_"));
const emit=(text,kind)=>window.dispatchEvent(new CustomEvent("sfcloudstatus",{detail:{text,kind}}));
let app=null,auth=null,db=null,currentInfo=null,unsubs=[],syncTimer=null;

function emailForUsername(username){return String(username||'').trim().toLowerCase()+'@spurgoflow.app'}
function clean(obj){
 const out={};
 Object.entries(obj||{}).forEach(([k,v])=>{if(v!==undefined && k!=='password')out[k]=v});
 return out;
}
function profileRef(uid){return doc(db,'profiles',uid)}
async function getProfile(uid){
 const snap=await getDoc(profileRef(uid));
 if(!snap.exists())throw new Error("Profilo utente non configurato.");
 return snap.data();
}
function stopListeners(){unsubs.forEach(x=>{try{x()}catch(e){}});unsubs=[]}

async function replaceCollection(name,rows){
 const snap=await getDocs(collection(db,name));
 const wanted=new Map(rows.map(x=>[String(x.id),clean(x)]));
 const batch=writeBatch(db);
 snap.forEach(d=>{if(!wanted.has(d.id))batch.delete(d.ref)});
 wanted.forEach((data,id)=>batch.set(doc(db,name,id),data,{merge:true}));
 await batch.commit();
}
async function upsertAllowed(name,rows){
 const batch=writeBatch(db);
 rows.forEach(x=>batch.set(doc(db,name,String(x.id)),clean(x),{merge:true}));
 await batch.commit();
}

async function syncFromGlobals(){
 if(!currentInfo||!window.SFState)return;
 clearTimeout(syncTimer);
 syncTimer=setTimeout(async()=>{
   try{
     const state=window.SFState.snapshot();
     if(currentInfo.role==='office'){
       emit("☁ Sincronizzazione…","sync");
       await Promise.all([
         replaceCollection('operators',state.operators),
         replaceCollection('teams',state.teams),
         replaceCollection('clients',state.clients),
         replaceCollection('vehicles',state.vehicles),
         replaceCollection('interventions',state.interventions),
         replaceCollection('messages',state.messages)
       ]);
     }else if(currentInfo.role==='operator'){
       const opid=currentInfo.operatorId;
       await upsertAllowed('messages',state.messages.filter(x=>x.operatorId===opid));
       await upsertAllowed('interventions',state.interventions.filter(x=>x.operatorId===opid));
     }
     emit("☁ Sincronizzato","ok");
   }catch(e){console.error(e);emit("☁ Errore sincronizzazione","err")}
 },250);
}

function listenCollection(name,qry=null){
 const ref=qry||collection(db,name);
 const u=onSnapshot(ref,snap=>{
   const rows=snap.docs.map(d=>({id:d.id,...d.data()}));
   window.SFState?.applyCloud(name,rows);
   emit("☁ Online · tempo reale","ok");
 },err=>{console.error('listener '+name,err);emit("☁ Listener interrotto","err")});
 unsubs.push(u);
}
async function seedOfficeIfEmpty(){
 const state=window.SFState.snapshot();
 for(const [name,rows] of Object.entries(state)){
   const snap=await getDocs(collection(db,name));
   if(snap.empty && rows.length)await upsertAllowed(name,rows);
 }
}

async function startRealtime(info){
 currentInfo=info;stopListeners();
 if(info.role==='office'){
   await seedOfficeIfEmpty();
   ['operators','teams','clients','vehicles','interventions','messages'].forEach(n=>listenCollection(n));
 }else{
   const opid=info.operatorId;
   listenCollection('operators',query(collection(db,'operators'),where('__name__','==',opid)));
   listenCollection('interventions',query(collection(db,'interventions'),where('operatorId','==',opid)));
   listenCollection('messages',query(collection(db,'messages'),where('operatorId','==',opid)));
 }
 emit("☁ Online · tempo reale","ok");
}
async function login(username,password){
 if(!configured)throw new Error("Firebase non configurato.");
 const email=emailForUsername(username);
 const cred=await signInWithEmailAndPassword(auth,email,password);
 const profile=await getProfile(cred.user.uid);
 if(profile.role==='operator'){
   const opSnap=await getDoc(doc(db,'operators',profile.operatorId));
   if(!opSnap.exists())throw new Error("Scheda operatore non trovata.");
   const operator={id:opSnap.id,...opSnap.data()};
   if(operator.active===false)throw new Error("Operatore disattivato.");
   return {role:'operator',operatorId:profile.operatorId,operator};
 }
 if(profile.role==='office')return {role:'office'};
 throw new Error("Ruolo non autorizzato.");
}
async function logout(){stopListeners();if(auth)await signOut(auth)}

async function provisionOperator(op,password){
 if(!configured||currentInfo?.role!=='office')throw new Error("Solo l'Ufficio cloud può creare operatori.");
 const secondary=initializeApp(cfg,'provision-'+Date.now());
 const secondaryAuth=getAuth(secondary);
 try{
   const email=emailForUsername(op.username);
   const cred=await createUserWithEmailAndPassword(secondaryAuth,email,password);
   await setDoc(doc(db,'operators',op.id),clean({...op,cloudUid:cred.user.uid,cloudEmail:email}),{merge:true});
   await setDoc(profileRef(cred.user.uid),{role:'operator',operatorId:op.id,username:op.username,active:true});
   await signOut(secondaryAuth);
   return {uid:cred.user.uid,email};
 }finally{try{await deleteApp(secondary)}catch(e){}}
}
async function changeOperatorPassword(op,oldPassword,newPassword){
 const secondary=initializeApp(cfg,'pwd-'+Date.now());
 const a=getAuth(secondary);
 try{
   const email=op.cloudEmail||emailForUsername(op.username);
   const cred=await signInWithEmailAndPassword(a,email,oldPassword);
   await updatePassword(cred.user,newPassword);
   await signOut(a);
 }finally{try{await deleteApp(secondary)}catch(e){}}
}

if(configured){
 try{
   app=initializeApp(cfg);auth=getAuth(app);db=getFirestore(app);
   emit("☁ Firebase pronto","ok");
 }catch(e){console.error(e);emit("☁ Configurazione Firebase errata","err")}
}else{
 emit("☁ Modalità locale","off");
}

window.SFCloud={
 enabled:configured,
 get ready(){return !!(configured&&currentInfo)},
 login,logout,startRealtime,syncFromGlobals,provisionOperator,changeOperatorPassword
};
