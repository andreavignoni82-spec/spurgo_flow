const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
})[character]);

export function dashboardMarkup(model) {
  const kpis = model.kpis.map(kpi =>
    `<div class="sf-dashboard__card sf-dashboard__kpi">${escapeHtml(kpi.label)}<strong>${escapeHtml(kpi.value)}</strong></div>`
  ).join('');
  const recent = model.recent.length ? model.recent.map(item => `
    <tr><td><span class="sf-dashboard__status">${escapeHtml(item.status)}</span></td>
    <td><b>${escapeHtml(item.client)}</b><br><small>${escapeHtml(item.address)}</small></td>
    <td>${escapeHtml(item.time)}</td><td>${escapeHtml(item.assignment)}</td></tr>`).join('') :
    '<tr><td colspan="4" class="sf-dashboard__empty">Nessun intervento registrato.</td></tr>';

  return `<div class="sf-dashboard">
    <header class="sf-dashboard__top"><div><h1>${escapeHtml(model.title)}</h1><div class="sf-dashboard__muted">${escapeHtml(model.subtitle)}</div></div><span class="sf-dashboard__build">${escapeHtml(model.build)}</span></header>
    <div class="sf-dashboard__kpis">${kpis}</div>
    <div class="sf-dashboard__grid">
      <section class="sf-dashboard__card"><h3>Interventi attivi / recenti</h3><div class="sf-dashboard__table-wrap"><table class="sf-dashboard__table"><thead><tr><th>Stato</th><th>Cliente</th><th>Ora</th><th>Assegnazione</th></tr></thead><tbody>${recent}</tbody></table></div></section>
      <aside class="sf-dashboard__card"><h3>Mappa interventi</h3><div id="officeMap" class="sf-dashboard__map real-map"></div><div id="officeMapHealth" class="sf-dashboard__map-health map-health">Mappa interventi: in attesa</div><div class="sf-dashboard__map-caption">Interventi presenti nel sistema.</div></aside>
    </div>
  </div>`;
}

export function renderDashboard(container, model) {
  if (!container) throw new TypeError('Dashboard container is required');
  container.innerHTML = dashboardMarkup(model);
}
