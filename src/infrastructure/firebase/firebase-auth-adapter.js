import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { mapAuthError } from './errors.js';

const identity = user => user ? Object.freeze({ uid: user.uid, email: user.email }) : null;
export function createFirebaseAuthAdapter({ auth, useEmulator }) {
  if (useEmulator !== true) throw new Error('Firebase production is disabled in v8 alpha.3');
  return Object.freeze({
    async login(email, password) { try { return identity((await signInWithEmailAndPassword(auth, email, password)).user); } catch (error) { throw mapAuthError(error); } },
    async logout() { try { await signOut(auth); } catch (error) { throw mapAuthError(error); } },
    currentIdentity: () => identity(auth.currentUser),
    onAuthChanged: callback => onAuthStateChanged(auth, user => callback(identity(user))),
    async createTestAccount(email, password) { try { return identity((await createUserWithEmailAndPassword(auth, email, password)).user); } catch (error) { throw mapAuthError(error); } },
  });
}
