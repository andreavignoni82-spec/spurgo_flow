import { createId, now } from '../../domain/shared/utils.js';
import { normalizeUsername } from '../auth/auth-service.js';
export class OperatorsService {
  constructor({ repository, clock=now, idFactory=createId }) { Object.assign(this,{repository,clock,idFactory}); }
  listOperators(){return this.repository.list();} getOperator(id){return this.repository.getById(id);}
  createOperator(input){const t=this.clock(),id=input.id??input.cloudUid??this.idFactory();return this.repository.create({...input,id,username:normalizeUsername(input.username),active:input.active!==false,createdAt:t,updatedAt:t});}
  updateOperator(id,input){const {id:_,password,...patch}=input;return this.repository.update(id,{...patch,...('username'in patch?{username:normalizeUsername(patch.username)}:{}),updatedAt:this.clock()});}
  async setActive(id,active){return this.updateOperator(id,{active:Boolean(active)});}
  removeOperator(id){return this.repository.remove(id);}
}
