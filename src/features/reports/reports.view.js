const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderReports(container, model, actions) {
  const rows=model.items.map(item=>`<button type="button" data-report="${esc(item.id)}"><b>${esc(item.reportNo??item.id)}</b><span>${esc(item.clientName??item.client)}</span><small>${esc(item.date)}</small></button>`).join('');
  container.innerHTML=`<div class="sf-reports"><header><div><h1>Rapportini</h1><p>Archivio dei rapportini persistiti</p></div><span>v7.0.0-alpha.10 · REPORTS MODULE</span></header>${model.fatalError?'<div class="sf-reports-error">Rapportini temporaneamente non disponibili.</div>':`<div class="sf-reports-layout"><aside>${rows||'<p>Nessun rapportino salvato.</p>'}</aside><main>${model.previewHtml||'<p>Seleziona un rapportino.</p>'}${model.previewHtml?'<div class="sf-reports-actions"><button data-action="print">Stampa / PDF</button><button data-action="share">Condividi</button></div>':''}<p class="sf-reports-error">${esc(model.error)}</p></main></div>`}</div>`;
  container.querySelectorAll('[data-report]').forEach(button=>button.addEventListener('click',()=>actions.select(button.dataset.report)));
  container.querySelector('[data-action="print"]')?.addEventListener('click',actions.print);
  container.querySelector('[data-action="share"]')?.addEventListener('click',actions.share);
}
