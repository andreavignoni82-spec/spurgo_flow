export const normalizeUsername=value=>String(value??'').trim().toLowerCase();
export const userEmail=username=>`${normalizeUsername(username)}@spurgoflow.app`;
export class AuthService{
  constructor({adapter}){if(!adapter)throw new TypeError('AuthService requires an auth adapter');this.adapter=adapter;this.identity=null}
  async login(username,password){const value=String(username??'').trim(),identity=await this.adapter.login(value.includes('@')?value:userEmail(value),password);if(identity?.active===false)throw new Error('Account disattivato.');if(!['office','operator'].includes(identity?.role))throw new Error('Account non autorizzato.');this.identity=identity;return identity}
  async loginOperator(username,password){const identity=await this.login(username,password);if(identity.role!=='operator')throw new Error('Account non autorizzato come operatore.');return identity}
  async loginOffice(username,password){const identity=await this.login(username,password);if(identity.role!=='office')throw new Error('Account non autorizzato come ufficio.');return identity}
  async logout(){await this.adapter.logout();this.identity=null}
  currentIdentity(){return this.identity??this.adapter.currentIdentity()}
  onAuthChanged(callback){return this.adapter.onAuthChanged(identity=>{if(identity?.role)this.identity=identity;else if(!identity)this.identity=null;callback(identity)})}
  async createOperatorAccount(username,password){const email=userEmail(username),identity=await this.adapter.createTestAccount(email,password,{role:'operator',operatorId:null,username:normalizeUsername(username),active:true});return Object.freeze({uid:identity.uid,email:identity.email??email})}
  createTestOperatorAccount(username,password){return this.createOperatorAccount(username,password)}
}
