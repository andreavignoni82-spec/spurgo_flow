export class FirebaseClient {
  constructor({ app, firestore } = {}) { this.app = app; this.firestore = firestore; }
  get database() {
    if (!this.firestore) throw new Error('Firebase Firestore adapter is not configured');
    return this.firestore;
  }
}
