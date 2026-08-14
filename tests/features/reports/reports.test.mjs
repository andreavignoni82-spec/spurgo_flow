import assert from 'node:assert/strict';
import { normalizeReport } from '../../../src/shared/models/report.js';
import { InterventionsRepository } from '../../../src/services/repositories/interventions-repository.js';
import { ReportsRepository } from '../../../src/services/repositories/reports-repository.js';
import { ReportsService } from '../../../src/services/reports/reports.service.js';
import { ReportPreviewService } from '../../../src/services/reports/report-preview.service.js';
import { ReportExportService } from '../../../src/services/reports/report-export.service.js';
import { ReportSharing } from '../../../src/features/reports/sharing/report-sharing.js';

const original={id:'INT-1',status:'Programmato',actualEnd:null,client:'Acme',address:'Via Roma',date:'2026-08-14',reportData:{relation:'rel',activities:['spurgo'],materials:['tubo'],operatorSignature:'data:op',customerSignature:'data:customer',photos:[{data:'data:image'}],notes:'old'}};
let stored=structuredClone(original);
const interventions=new InterventionsRepository({list:()=>[stored],getById:()=>stored,update:(_id,patch)=>{stored={...stored,...structuredClone(patch)};return stored;}});
const events=[];
const reports=new ReportsService({repository:new ReportsRepository({interventionsRepository:interventions}),eventBus:{emit:(...args)=>events.push(args)}});

assert.equal(normalizeReport({},'A').interventionId,'A');
assert.equal(normalizeReport({report:'legacy',signature:'customer',signer:'Mario'},'A').relation,'legacy');
assert.equal(normalizeReport({report:'legacy',signature:'customer',signer:'Mario'},'A').customerSignature,'customer');

await reports.updateReport('INT-1',{notes:'nuova nota'});
assert.equal(stored.reportData.notes,'nuova nota');
for(const field of ['relation','activities','materials','operatorSignature','customerSignature','photos'])assert.deepEqual(stored.reportData[field],original.reportData[field]);
assert.equal(stored.status,'Programmato');assert.equal(stored.actualEnd,null);

await reports.attachSignature('INT-1','operator',{dataUrl:'data:new-op',signedAt:'2026-08-14T10:00:00Z'});
await reports.attachSignature('INT-1','customer',{dataUrl:'data:new-customer',signedAt:'2026-08-14T10:01:00Z'});
await assert.rejects(()=>reports.attachSignature('INT-1','customer',''),/Firma non acquisita/);
const refreshedRepository=new ReportsRepository({interventionsRepository:interventions});
const refreshed=new ReportsService({repository:refreshedRepository});
assert.equal((await refreshed.getReport('INT-1')).operatorSignature,'data:new-op');
assert.equal((await refreshed.getReport('INT-1')).customerSignature,'data:new-customer');

await reports.attachPhoto('INT-1',{data:'data:second',category:'DOPO'});
assert.equal((await refreshed.getReport('INT-1')).photos.length,2);
assert.deepEqual(events.at(-1),['report:photosUpdated',{interventionId:'INT-1'}]);

const preview=new ReportPreviewService();
const input={intervention:await interventions.getById('INT-1'),report:await refreshed.getReport('INT-1')};
assert.deepEqual(preview.createViewModel(input),preview.createViewModel(structuredClone(input)));

const beforeFailure=structuredClone(stored);
assert.throws(()=>new ReportExportService({open:()=>null}).print('<article/>'),/Esportazione temporaneamente/);
assert.deepEqual(stored,beforeFailure);
await assert.rejects(()=>new ReportSharing({share:()=>Promise.reject(new Error('share failed'))}).share({text:'report'}),/share failed/);
assert.deepEqual(stored,beforeFailure);
console.log('Reports model, patch, signatures refresh, photos, preview and failure isolation passed');
