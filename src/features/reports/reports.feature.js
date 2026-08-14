import { reportArchive } from './reports.model.js';
import { renderReports } from './reports.view.js';
import { reportTemplate } from './preview/report-template.js';

export class ReportsFeature {
  id='reports'; #container; #context; #items=[]; #selected; #html=''; #error=''; #fatal=false; #off=[];
  async mount(container, context) { this.unmount(); this.#container=container; this.#context=context; for(const event of ['report:created','report:updated','report:signatureUpdated','report:photosUpdated'])this.#off.push(context.eventBus.on(event,()=>this.#container&&void this.refresh())); await this.refresh(); }
  unmount(){this.#off.splice(0).forEach(off=>off());this.#container=undefined;this.#context=undefined;this.#selected=undefined;this.#html='';}
  async refresh(){try{this.#items=reportArchive(await this.#context.repositories.interventions.list());this.#fatal=false;if(this.#selected)await this.#load(this.#selected,false);}catch{this.#fatal=true;}this.#render();}
  #select=id=>{void this.#load(id,true);};
  async #load(id,render){try{const intervention=await this.#context.repositories.interventions.getById(id);const report=await this.#context.services.reports.getReport(id);const vm=this.#context.services.reportPreview.createViewModel({intervention,report});this.#selected=id;this.#html=reportTemplate(vm);this.#error='';}catch(error){this.#error=error?.message||String(error);}if(render)this.#render();}
  #print=()=>{try{this.#context.services.reportExport.print(this.#html);}catch{this.#error='Esportazione temporaneamente non disponibile.';this.#render();}};
  #share=async()=>{try{await this.#context.services.reportSharing.share({text:`Rapportino intervento ${this.#selected}`});}catch(error){if(error?.name!=='AbortError')this.#error='Condivisione temporaneamente non disponibile.';this.#render();}};
  #render(){if(this.#container)renderReports(this.#container,{items:this.#items,previewHtml:this.#html,error:this.#error,fatalError:this.#fatal},{select:this.#select,print:this.#print,share:this.#share});}
}
export const reportsFeature=new ReportsFeature();
