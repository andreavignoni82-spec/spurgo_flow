import { clone } from '../../../domain/shared/utils.js';
import { normalizeClient, validateClient } from '../../../domain/clients/client.js';
import { normalizeOperator, validateOperator } from '../../../domain/operators/operator.js';
import { normalizeTeam, validateTeam } from '../../../domain/teams/team.js';
import { normalizeVehicle, validateVehicle } from '../../../domain/vehicles/vehicle.js';
import { normalizeIntervention, validateIntervention } from '../../../domain/interventions/intervention.js';
import { normalizeReport, validateReport } from '../../../domain/reports/report.js';
import { normalizeMessage, validateMessage } from '../../../domain/messages/message.js';
import { semanticMerge } from '../../repositories/memory/base-memory-repository.js';
import { RepositoryError, mapRepositoryError } from '../errors.js';
const failure=(error,operation,idField,id)=>{if(error instanceof RepositoryError)return error;if(error?.code==='already-exists')return new RepositoryError('DUPLICATE_ID',`Duplicate ${idField}: ${id}`,{cause:error});if(error?.code==='not-found')return new RepositoryError('MISSING_ID',`Missing ${idField}: ${id}`,{cause:error});const mapped=mapRepositoryError(error);mapped.operation=operation;return mapped};
export class FirebaseRepositoryAdapter{
 constructor({collection,idField='id',client,normalize=clone,validate=()=>true}){if(!client)throw new Error('Firebase client is required');Object.assign(this,{collection,idField,client,normalize,validate})}
 #read(value){if(!value)return null;return clone(this.normalize(value))}
 async list(){try{return(await this.client.adapter.list(this.collection)).map(value=>this.#read(value))}catch(error){throw failure(error,'list',this.idField)}}
 async getById(id){try{return this.#read(await this.client.adapter.get(this.collection,id))}catch(error){throw failure(error,'getById',this.idField,id)}}
 async create(record){const value=this.normalize(record),id=value[this.idField];this.validate(value);try{return this.#read(await this.client.adapter.create(this.collection,id,clone(value)))}catch(error){throw failure(error,'create',this.idField,id)}}
 async update(id,patch){const current=await this.getById(id);if(!current)throw new RepositoryError('MISSING_ID',`Missing ${this.idField}: ${id}`);if(patch[this.idField]!==undefined&&patch[this.idField]!==id)throw new RepositoryError('IMMUTABLE_ID',`${this.idField} is immutable`);const value=this.normalize(semanticMerge(current,patch));value[this.idField]=id;this.validate(value);try{return this.#read(await this.client.adapter.update(this.collection,id,clone(value)))}catch(error){throw failure(error,'update',this.idField,id)}}
 async remove(id){if(!await this.getById(id))throw new RepositoryError('MISSING_ID',`Missing ${this.idField}: ${id}`);try{return this.#read(await this.client.adapter.remove(this.collection,id))}catch(error){throw failure(error,'remove',this.idField,id)}}
}
export function createFirebaseRepositories({client}){
 const definitions={clients:[normalizeClient,validateClient],operators:[normalizeOperator,validateOperator],teams:[normalizeTeam,validateTeam],vehicles:[normalizeVehicle,validateVehicle],interventions:[normalizeIntervention,validateIntervention],reports:[normalizeReport,validateReport],messages:[normalizeMessage,validateMessage]};
 const make=(name,idField='id')=>new FirebaseRepositoryAdapter({collection:name,idField,client,normalize:definitions[name][0],validate:definitions[name][1]});
 const interventions=make('interventions');
 interventions.queryByDate=async date=>(await client.adapter.query('interventions','date',date)).map(value=>interventions.#read?.(value)??normalizeIntervention(value));
 interventions.queryByOperator=async id=>(await client.adapter.queryArray('interventions','assignedOperatorIds',id)).map(normalizeIntervention);
 interventions.queryByTeam=async id=>(await client.adapter.queryArray('interventions','assignedTeamIds',id)).map(normalizeIntervention);
 const teams=make('teams');teams.queryByOperator=async id=>(await client.adapter.queryArray('teams','operatorIds',id)).map(normalizeTeam);
 const reports=make('reports','interventionId');reports.getByInterventionId=id=>reports.getById(id);reports.save=async(id,report)=>await reports.getById(id)?reports.update(id,report):reports.create({...report,interventionId:id});
 return{clients:make('clients'),operators:make('operators'),teams,vehicles:make('vehicles'),interventions,reports,messages:make('messages')};
}
