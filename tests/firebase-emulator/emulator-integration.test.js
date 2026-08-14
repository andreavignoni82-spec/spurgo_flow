import test from 'node:test'; import assert from 'node:assert/strict';
import { createFirebaseClient } from '../../src/infrastructure/firebase/firebase-client.js';
import { createFirebaseRepositories } from '../../src/infrastructure/firebase/firebase-repositories/index.js';
import { AuthService } from '../../src/services/auth/auth-service.js';
import { createFirebaseAuthAdapter } from '../../src/infrastructure/firebase/firebase-auth-adapter.js';

const enabled=process.env.FIREBASE_EMULATOR_RUN==='1';
const config={host:'127.0.0.1',firestorePort:8080,authPort:9099,projectId:'spurgoflow-v8-alpha3-test',apiKey:'demo-test-only',authDomain:'localhost',appId:'1:test:web:test',useEmulator:true};
test('Firestore/Auth emulator integration (set FIREBASE_EMULATOR_RUN=1)',{skip:!enabled},async()=>{
  const client=createFirebaseClient(config);
  try{
    const repositories=createFirebaseRepositories({client});
    const auth=new AuthService({adapter:createFirebaseAuthAdapter({auth:client.auth,provisionUser:client.provisionUser,loadProfile:client.loadProfile})});
    const username=`operator-${Date.now()}`,account=await auth.createOperatorAccount(username,'test-password-123');
    await repositories.operators.create({id:account.uid,username,name:'Test',active:true,cloudUid:account.uid,cloudEmail:account.email,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
    await auth.logout(); const identity=await auth.loginOperator(username,'test-password-123'); assert.equal(identity.email,`${username}@spurgoflow.app`); assert.equal(identity.operatorId,account.uid);
    const id=`i-${Date.now()}`; const intervention={id,clientId:'c1',address:'Via Test',coordinates:{latitude:45,longitude:9},date:'2026-08-14',startTime:'10:00',estimatedMinutes:60,type:'SPURGO',priority:'NORMALE',status:'PROGRAMMATO',assignedOperatorIds:[account.uid],assignedTeamIds:[]};
    await assert.rejects(repositories.interventions.create(intervention),/Permessi insufficienti|operation/i);
    await auth.logout(); await assert.rejects(auth.loginOperator(username,'wrong-password'),error=>error.code==='INVALID_CREDENTIALS');
  } finally { await client.close(); }
});
