import { createId, now } from '../../domain/shared/utils.js';
export class TeamsService {
  constructor({repository,clock=now,idFactory=createId}){Object.assign(this,{repository,clock,idFactory});}
  listTeams(){return this.repository.list();} getTeam(id){return this.repository.getById(id);}
  listForOperator(operatorId){return this.repository.queryByOperator?this.repository.queryByOperator(operatorId):this.repository.list().then(rows=>rows.filter(team=>team.operatorIds?.includes(operatorId)));}
  createTeam(input){const t=this.clock();return this.repository.create({...input,id:this.idFactory(),operatorIds:[...new Set(input.operatorIds??[])],active:input.active!==false,createdAt:t,updatedAt:t});}
  updateTeam(id,input){const {id:_,...patch}=input;return this.repository.update(id,{...patch,...('operatorIds'in patch?{operatorIds:[...new Set(patch.operatorIds)]}:{}),updatedAt:this.clock()});}
  setActive(id,active){return this.updateTeam(id,{active:Boolean(active)});}
}
