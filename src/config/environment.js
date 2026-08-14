export class ConfigurationError extends Error {
  constructor(code, component, message) {
    super(message); this.name='ConfigurationError'; this.code=code; this.component=component;
  }
}
function validateFirebaseConfig(firebase){
  if(!firebase)throw new ConfigurationError('BOOT_CONFIG_FIREBASE_MISSING','environment.firebase','Firebase configuration is missing');
  for(const key of ['apiKey','projectId','authDomain','appId'])if(!firebase[key])throw new ConfigurationError('BOOT_CONFIG_FIREBASE_FIELD_MISSING',`environment.firebase.${key}`,`Firebase configuration is missing: ${key}`);
  if(firebase.useEmulator===true){for(const key of ['host','firestorePort','authPort'])if(!firebase[key])throw new ConfigurationError('BOOT_CONFIG_FIREBASE_EMULATOR_FIELD_MISSING',`environment.firebase.${key}`,`Firebase emulator configuration is missing: ${key}`);}
}
export function createEnvironment(source={}){
  const suppliedFirebase=source.firebase??globalThis.__SPURGO_FLOW_FIREBASE__??null;
  const requestedDriver=source.dataDriver??source.driver??(suppliedFirebase?'firebase':'memory');
  const driver=requestedDriver==='firebase-emulator'?'firebase':requestedDriver;
  if(!['memory','firebase'].includes(driver))throw new ConfigurationError('BOOT_CONFIG_UNKNOWN_DRIVER','environment.driver',`Unknown data driver: ${requestedDriver}`);
  if(driver==='memory')return Object.freeze({driver,fallbackToMemory:false,firebase:null});
  const firebase=suppliedFirebase?Object.freeze({...suppliedFirebase,useEmulator:suppliedFirebase.useEmulator===true}):null;
  validateFirebaseConfig(firebase);
  return Object.freeze({driver,fallbackToMemory:source.fallbackToMemory===true,firebase});
}
export const readEnvironment=createEnvironment;
export const environment=createEnvironment();
