const STORE_KEY='spurgoflow-auth-v1';
const memoryStore=new Map();
const encoder=new TextEncoder();
const hex=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
const randomSalt=()=>{const bytes=new Uint8Array(16);globalThis.crypto?.getRandomValues?.(bytes);return hex(bytes)};
async function digest(password,salt){if(globalThis.crypto?.subtle){const data=encoder.encode(`${salt}:${password}`);return hex(new Uint8Array(await crypto.subtle.digest('SHA-256',data)))}return btoa(`${salt}:${password}`)}
function readStore(){try{return JSON.parse(globalThis.localStorage?.getItem(STORE_KEY)||'{}')}catch{return Object.fromEntries(memoryStore)}}
function writeStore(store){try{globalThis.localStorage?.setItem(STORE_KEY,JSON.stringify(store))}catch{memoryStore.clear();Object.entries(store).forEach(([k,v])=>memoryStore.set(k,v))}}
export function createMemoryAuthAdapter(){
 let current=null;const listeners=new Set();const publish=()=>listeners.forEach(listener=>listener(current));
 return Object.freeze({
  async login(email,password){
   if(email==='ufficio@office.spurgoflow.test'){if(password!=='ufficio')throw new Error('Credenziali Ufficio non valide');current=Object.freeze({uid:'memory:office',email,role:'office'});publish();return current}
   const account=readStore()[email];if(!account)throw new Error('Account operatore non registrato');const hash=await digest(password,account.salt);if(hash!==account.hash)throw new Error('Credenziali operatore non valide');current=Object.freeze({uid:account.uid,email,role:'operator'});publish();return current;
  },
  async logout(){current=null;publish()},currentIdentity:()=>current,onAuthChanged(callback){listeners.add(callback);callback(current);return()=>listeners.delete(callback)},
  async createTestAccount(email,password){if(!email||!password||password.length<6)throw new Error('Password operatore: minimo 6 caratteri');const store=readStore();if(store[email])throw new Error('Username operatore già registrato');const salt=randomSalt(),hash=await digest(password,salt),uid=`memory:${crypto.randomUUID?.()||Date.now()}`;store[email]={uid,email,salt,hash};writeStore(store);return Object.freeze({uid,email,role:'operator'})},
  health:()=>Object.freeze({status:'local',mode:'memory'})
 })
}
