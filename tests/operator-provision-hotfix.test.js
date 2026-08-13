const assert=require('assert');
const fs=require('fs');

const sync=fs.readFileSync('firebase-sync.js','utf8');
const html=fs.readFileSync('index.html','utf8');

function functionSource(source,name){
  const start=source.indexOf(`async function ${name}(`);
  assert.notStrictEqual(start,-1,`${name} non trovata`);
  const brace=source.indexOf('{',start);
  let depth=0;
  for(let i=brace;i<source.length;i++){
    if(source[i]==='{')depth++;
    if(source[i]==='}'&&--depth===0)return source.slice(start,i+1);
  }
  throw new Error(`Chiusura ${name} non trovata`);
}

const provisionSource=functionSource(sync,'provisionOperator');
const makeProvision=new Function('deps',`
  const {configured,currentInfo,initializeApp,cfg,getAuth,emailForUsername,
    createUserWithEmailAndPassword,setDoc,doc,db,clean,profileRef,deleteDoc,
    deleteUser,signOut,deleteApp,console}=deps;
  ${provisionSource}
  return provisionOperator;
`);

function scenario({authError,failAt}={}){
  const calls=[];
  let writes=0;
  const user={uid:'uid-paolo'};
  const deps={
    configured:true,currentInfo:{role:'office'},cfg:{},db:{},console:{warn(){}} ,
    initializeApp:()=>({}),getAuth:()=>({}),emailForUsername:u=>u.trim().toLowerCase()+'@spurgoflow.app',
    createUserWithEmailAndPassword:async(a,email)=>{calls.push(['auth-create',email]);if(authError)throw authError;return {user}},
    setDoc:async(ref,data)=>{writes++;calls.push(['set',ref.path]);if(failAt===writes)throw Object.assign(new Error('denied'),{code:'permission-denied'})},
    doc:(db,col,id)=>({path:`${col}/${id}`}),clean:o=>o,profileRef:uid=>({path:`profiles/${uid}`}),
    deleteDoc:async ref=>calls.push(['delete-doc',ref.path]),deleteUser:async u=>calls.push(['delete-user',u.uid]),
    signOut:async()=>calls.push(['sign-out']),deleteApp:async()=>calls.push(['delete-app'])
  };
  return {calls,run:makeProvision(deps)({id:'op-paolo',username:' Paolo.Verdi '},'secret')};
}

(async()=>{
  // A: username nuovo, Auth + operators + profile.
  let s=scenario();
  const cloud=await s.run;
  assert.deepStrictEqual(cloud,{uid:'uid-paolo',email:'paolo.verdi@spurgoflow.app'});
  assert.deepStrictEqual(s.calls.slice(0,3),[
    ['auth-create','paolo.verdi@spurgoflow.app'],['set','operators/op-paolo'],['set','profiles/uid-paolo']
  ]);

  // C: account Auth preesistente: errore applicativo, nessuna scrittura/cancellazione.
  s=scenario({authError:Object.assign(new Error('Firebase: Error (auth/email-already-in-use)'),{code:'auth/email-already-in-use'})});
  await assert.rejects(s.run,e=>e.code==='SF_USERNAME_ALREADY_IN_USE'&&e.message==='Username già utilizzato nel sistema cloud. Scegli un altro username.');
  assert(!s.calls.some(c=>c[0]==='set'||c[0]==='delete-user'));

  // D: fallimento operators: pulizia documenti e solo utente appena creato.
  s=scenario({failAt:1});
  await assert.rejects(s.run,e=>e.code==='SF_OPERATOR_PROVISION_FAILED');
  assert.deepStrictEqual(s.calls.filter(c=>c[0]==='delete-doc'||c[0]==='delete-user'), [
    ['delete-doc','profiles/uid-paolo'],['delete-doc','operators/op-paolo'],['delete-user','uid-paolo']
  ]);

  // E: fallimento profile: stesso rollback completo, incluso operator parziale.
  s=scenario({failAt:2});
  await assert.rejects(s.run,e=>e.code==='SF_OPERATOR_PROVISION_FAILED');
  assert.deepStrictEqual(s.calls.filter(c=>c[0]==='delete-doc'||c[0]==='delete-user'), [
    ['delete-doc','profiles/uid-paolo'],['delete-doc','operators/op-paolo'],['delete-user','uid-paolo']
  ]);

  // B/F: confronto locale case-insensitive anche tramite cloudEmail sincronizzata.
  assert.match(html,/normalizeOperatorUsername\(o\.username\)===normalized/);
  assert.match(html,/operatorUsernameFromEmail\(o\.cloudEmail\)===normalized/);
  assert.match(html,/Username già assegnato a un operatore\./);

  // G: i campi vengono azzerati esclusivamente nel ramo di successo, dopo push.
  const addSource=functionSource(html,'addOperator');
  const catchAt=addSource.indexOf('}catch(err)');
  assert(addSource.indexOf("['opNome','opCognome','opUsername','opPassword','opTelefono','opRuolo']")<catchAt);
  assert(!addSource.slice(catchAt).includes(".value=''"));
  assert.match(addSource,/SF_USERNAME_ALREADY_IN_USE[\s\S]*Username già utilizzato nel sistema cloud\. Scegli un altro username\./);
  assert.doesNotMatch(addSource,/Firebase: Error|Errore: /);

  console.log('v6.1.23.3: provisioning, duplicati, rollback, normalizzazione e conservazione form verificati');
})().catch(error=>{console.error(error);process.exitCode=1});
