import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { initializeFirestore, connectFirestoreEmulator, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions';

export function createFirebaseClient(config={}){
  const appConfig={apiKey:config.apiKey,authDomain:config.authDomain,projectId:config.projectId,storageBucket:config.storageBucket,messagingSenderId:config.messagingSenderId,appId:config.appId,measurementId:config.measurementId};
  const app=initializeApp(appConfig,`spurgoflow-${crypto.randomUUID()}`);
  const firestore=initializeFirestore(app,{experimentalAutoDetectLongPolling:true});
  const auth=getAuth(app);
  const functions=getFunctions(app,'europe-west1');
  if(config.useEmulator===true){connectFirestoreEmulator(firestore,config.host,Number(config.firestorePort));connectAuthEmulator(auth,`http://${config.host}:${config.authPort}`,{disableWarnings:true});connectFunctionsEmulator(functions,config.host,Number(config.functionsPort??5001));}
  const row=snapshot=>({...snapshot.data(),id:snapshot.id});
  const adapter={
    async list(name){return (await getDocs(collection(firestore,name))).docs.map(row)},
    async get(name,id){const snapshot=await getDoc(doc(firestore,name,id));return snapshot.exists()?row(snapshot):null},
    async create(name,id,value){const reference=doc(firestore,name,id);if((await getDoc(reference)).exists()){const error=new Error(`Duplicate document: ${id}`);error.code='already-exists';throw error}await setDoc(reference,value);return {...value,id}},
    async update(name,id,value){await setDoc(doc(firestore,name,id),value,{merge:true});const snapshot=await getDoc(doc(firestore,name,id));return row(snapshot)},
    async remove(name,id){const reference=doc(firestore,name,id),snapshot=await getDoc(reference);if(!snapshot.exists()){const error=new Error(`Missing document: ${id}`);error.code='not-found';throw error}await deleteDoc(reference);return row(snapshot)},
    async query(name,field,value){return (await getDocs(query(collection(firestore,name),where(field,'==',value)))).docs.map(row)},
    async queryArray(name,field,value){return (await getDocs(query(collection(firestore,name),where(field,'array-contains',value)))).docs.map(row)}
  };
  const loadProfile=async uid=>{const snapshot=await getDoc(doc(firestore,'profiles',uid));return snapshot.exists()?snapshot.data():null};
  const saveProfile=(uid,profile)=>setDoc(doc(firestore,'profiles',uid),profile,{merge:true});
  async function provisionUser(email,password,profile={}){
    const secondaryApp=initializeApp(appConfig,`spurgoflow-provision-${crypto.randomUUID()}`),secondaryAuth=getAuth(secondaryApp);
    try{
      if(config.useEmulator===true)connectAuthEmulator(secondaryAuth,`http://${config.host}:${config.authPort}`,{disableWarnings:true});
      const credential=await createUserWithEmailAndPassword(secondaryAuth,email,password);
      const finalProfile={...profile,...(profile.role==='operator'?{operatorId:credential.user.uid}: {})};
      await saveProfile(credential.user.uid,finalProfile);
      return Object.freeze({uid:credential.user.uid,email:credential.user.email,...finalProfile});
    } finally {try{await signOut(secondaryAuth)}catch{}await deleteApp(secondaryApp)}
  }
  async function deleteOperatorAccount(uid){const result=await httpsCallable(functions,'deleteOperator')({uid});return result.data;}
  return Object.freeze({app,auth,firestore,functions,adapter,loadProfile,saveProfile,provisionUser,deleteOperatorAccount,config:Object.freeze({...config}),close:()=>deleteApp(app)});
}
