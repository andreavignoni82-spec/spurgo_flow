import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { mapAuthError } from './errors.js';
const identity=user=>user?Object.freeze({uid:user.uid,email:user.email}):null;
export function createFirebaseAuthAdapter({auth,provisionUser}){
  return Object.freeze({
    async login(email,password){try{return identity((await signInWithEmailAndPassword(auth,email,password)).user)}catch(error){throw mapAuthError(error)}},
    async logout(){try{await signOut(auth)}catch(error){throw mapAuthError(error)}},
    currentIdentity:()=>identity(auth.currentUser),
    onAuthChanged:callback=>onAuthStateChanged(auth,user=>callback(identity(user))),
    async createTestAccount(email,password){try{if(!provisionUser)throw new Error('Account provisioning is not configured');return await provisionUser(email,password)}catch(error){throw mapAuthError(error)}}
  });
}
