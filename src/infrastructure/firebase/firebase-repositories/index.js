import { clone } from '../../../domain/shared/utils.js';
import { normalizeClient, validateClient } from '../../../domain/clients/client.js';
import { normalizeOperator, validateOperator } from '../../../domain/operators/operator.js';
import { normalizeTeam, validateTeam } from '../../../domain/teams/team.js';
import { normalizeVehicle, validateVehicle } from '../../../domain/vehicles/vehicle.js';
import { normalizeIntervention, validateIntervention } from '../../../domain/interventions/intervention.js';
import { normalizeReport, validateReport } from '../../../domain/reports/report.js';
import { normalizeMessage, validateMessage } from '../../../domain/messages/message.js';
import { InterventionStatus } from '../../../domain/interventions/constants.js';
import { semanticMerge } from '../../repositories/memory/base-memory-repository.js';
import { RepositoryError, mapRepositoryError } from '../errors.js';
const failure=(error,operation,idField,id)=>{if(error instanceof RepositoryError)return error;if(error?.code==='already-exists')return new RepositoryError('DUPLICATE_ID',`Duplicate ${idField}: ${id}`,{cause:error});if(error?.code==='not-found')return new RepositoryError('MISSING_ID',`Missing ${idField}: ${id}`,{cause:error});const mapped=mapRepositoryError(error);mapped.operation=operation;return mapped};
const unique=rows=>[...new Map(rows.map(row=>[String(row.id),row])).values()];
const LEGACY_REPORT_FIELDS=Object.freeze(['relation','signatures','photos','materials','reportData']);
const STATUS_ALIASES=Object.freeze({PROGRAMMATO:'PROGRAMMATO',PROGRAMMATA:'PROGRAMMATO',PROGRAMMED:'PROGRAMMATO',SCHEDULED:'PROGRAMMATO',IN_CORSO:'IN_CORSO','IN CORSO':'IN_CORSO',IN_PROGRESS:'IN_CORSO',TERMINATO:'TERMINATO',TERMINATA:'TERMINATO',COMPLETATO:'TERMINATO',COMPLETATA:'TERMINATO',COMPLETED:'TERMINATO',ANNULLATO:'ANNULLATO',ANNULLATA:'ANNULLATO',CANCELLED:'ANNULLATO',CANCELED:'ANNULLATO',RIAPERTO:'RIAPERTO',RIAPERTA:'RIAPERTO',REOPENED:'RIAPERTO'});
function migrateLegacyIntervention(value){const migrated=clone(value??{});for(const key of LEGACY_REPORT_FIELDS)delete migrated[key];const raw=String(migrated.status??'').trim().toUpperCase();const allowed=Object.values(InterventionStatus);migrated.status=allowed.includes(raw)?raw:(STATUS_ALIASES[raw]??InterventionStatus.PROGRAMMATO);return migrated;}
export class FirebaseRepositoryAdapter{
 constructor({collection,idField='id',client,normalize=clone,validate=()=>true,migrate=value=>value}){if(!client)throw new Error('Firebase client is required');Object.assign(this,{collection,idField,client,normalize,validate,migrate})}
 #read(value){if(!value)return null;return clone(this.normalize(this.migrate(value)))}
 async list(){try{return(await this.client.adapter.list(this.collection)).map(value=>this.#read(value))}catch(error){throw failure(error,'list',this.idField)}}
 async getById(id){try{return this.#read(await this.client.adapter.get(this.collection,id))}catch(error){throw failure(error,'getById',this.idField,id)}}
 async create(record){const value=this.normalize(this.migrate(record)),id=value[this.idField];this.validate(value);try{return this.#read(await this.client.adapter.create(this.collection,id,clone(value)))}catch(error){throw failure(error,'create',this.idField,id)}}
 async update(id,patch){const rawCurrent=await this.client.adapter.get(this.collection,id);if(!rawCurrent)throw new RepositoryError('MISSING_ID',`Missing ${this.idField}: ${id}`);if(patch[this.idField]!==undefined&&patch[this.idField]!==id)throw new RepositoryError('IMMUTABLE_ID',`${this.idField} is immutable`);const current=this.normalize(this.migrate(rawCurrent));const value=this.normalize(this.migrate(semanticMerge(current,patch)));value[this.idField]=id;this.validate(value);try{return this.#read(await this.client.adapter.replace?.(this.collection,id,clone(value))??await this.client.adapter.update(this.collection,id,clone(value)))}catch(error){throw failure(error,'update',this.idField,id)}}
 async remove(id){if(!await this.getById(id))throw new RepositoryError('MISSING_ID',`Missing ${this.idField}: ${id}`);try{return this.#read(await this.client.adapter.remove(this.collection,id))}catch(error){throw failure(error,'remove',this.idField,id)}}
}
export function createFirebaseRepositories({client}){
 const definitions={clients:[normalizeClient,validateClient],operators:[normalizeOperator,validateOperator],teams:[normalizeTeam,validateTeam],vehicles:[normalizeVehicle,validateVehicle],interventions:[normalizeIntervention,validateIntervention],reports:[normalizeReport,validateReport],messages:[normalizeMessage,validateMessage]};
 const make=(name,idField='id',migrate=value=>value)=>new FirebaseRepositoryAdapter({collection:name,idField,client,normalize:definitions[name][0],validate:definitions[name][1],migrate});
 const interventions=make('interventions','id',migrateLegacyIntervention);
 interventions.queryByDate=async date=>(await client.adapter.query('interventions','date',date)).map(value=>clone(normalizeIntervention(migrateLegacyIntervention(value))));
 interventions.queryByOperator=async id=>unique([...(await client.adapter.query('interventions','operatorId',id)),...(await client.adapter.queryArray('interventions','assignedOperatorIds',id))]).map(value=>clone(normalizeIntervention(migrateLegacyIntervention(value))));
 interventions.queryByTeam=async id=>unique([...(await client.adapter.query('interventions','teamId',id)),...(await client.adapter.queryArray('interventions','assignedTeamIds',id))]).map(value=>clone(normalizeIntervention(migrateLegacyIntervention(value))));
 const teams=make('teams');teams.queryByOperator=async id=>(await client.adapter.queryArray('teams','operatorIds',id)).map(value=>clone(normalizeTeam(value)));
 const reports=make('reports','interventionId');reports.getByInterventionId=id=>reports.getById(id);reports.save=async(id,report)=>await reports.getById(id)?reports.update(id,report):reports.create({...report,interventionId:id});
 return{clients:make('clients'),operators:make('operators'),teams,vehicles:make('vehicles'),interventions,reports,messages:make('messages')};
}
