export const normalizeUsername=value=>String(value??'').trim().toLowerCase();
export const userEmail=username=>`${normalizeUsername(username)}@spurgoflow.app`;
export class AuthService{
  constructor({adapter}){if(!adapter)throw new TypeError('AuthService requires an auth adapter');this.adapter=adapter}
  async loginOperator(username,password){const identity=await this.adapter.login(String(username).includes('@')?username:userEmail(username),password);if(identity?.role!=='operator')throw new Error('Account non autorizzato come operatore.');if(identity.active===false)throw new Error('Operatore disattivato.');return identity}
  async loginOffice(username,password){const value=String(username??'').trim();const identity=await this.adapter.login(value.includes('@')?value:userEmail(value),password);if(identity?.role!=='office')throw new Error('Account non autorizzato come ufficio.');return identity}
  logout(){return this.adapter.logout()}
  currentIdentity(){return this.adapter.currentIdentity()}
  onAuthChanged(callback){return this.adapter.onAuthChanged(callback)}
  async createOperatorAccount(username,password){const email=userEmail(username);const identity=await this.adapter.createTestAccount(email,password,{role:'operator',operatorId:null,username:normalizeUsername(username),active:true});return Object.freeze({uid:identity.uid,email:identity.email??email})}
  createTestOperatorAccount(username,password){return this.createOperatorAccount(username,password)}
}
