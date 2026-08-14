import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { mapAuthError } from './errors.js';
const basic=user=>user?{uid:user.uid,email:user.email}:null;
export function createFirebaseAuthAdapter({auth,provisionUser,loadProfile,deleteProfile}){
  const withProfile=async user=>{if(!user)return null;const profile=await loadProfile?.(user.uid);if(!profile)throw new Error('Profilo utente non configurato.');return Object.freeze({...basic(user),...profile})};
  return Object.freeze({
    async login(email,password){try{return await withProfile((await signInWithEmailAndPassword(auth,email,password)).user)}catch(error){throw mapAuthError(error)}},
    async logout(){try{await signOut(auth)}catch(error){throw mapAuthError(error)}},
    currentIdentity:()=>basic(auth.currentUser),
    onAuthChanged:callback=>onAuthStateChanged(auth,async user=>{try{callback(await withProfile(user))}catch{callback(basic(user))}}),
    async createTestAccount(email,password,profile={}){try{if(!provisionUser)throw new Error('Account provisioning is not configured');return await provisionUser(email,password,profile)}catch(error){throw mapAuthError(error)}},
    async revokeOperatorAccess(uid){if(!deleteProfile)throw new Error('Revoca accesso operatore non configurata.');return deleteProfile(uid)}
  });
}
