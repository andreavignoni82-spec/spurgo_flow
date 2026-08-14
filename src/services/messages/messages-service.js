import { createId, now } from '../../domain/shared/utils.js';
export class MessagesService {
  #pending=new Map(); constructor({repository,clock=now,idFactory=createId}){Object.assign(this,{repository,clock,idFactory});}
  listMessages(){return this.repository.list();}
  sendMessage(input){const key=JSON.stringify(input);if(this.#pending.has(key))return this.#pending.get(key);const t=this.clock();const task=this.repository.create({...input,id:this.idFactory(),read:false,createdAt:t,updatedAt:t}).finally(()=>this.#pending.delete(key));this.#pending.set(key,task);return task;}
  markRead(id){return this.repository.update(id,{read:true,updatedAt:this.clock()});}
}
