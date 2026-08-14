const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);

export function renderOperatorAgenda(container, model) {
  container.innerHTML = `<section class="sf-operator-agenda" aria-labelledby="operator-agenda-title">
    <h1 id="operator-agenda-title">Agenda personale</h1>
    <div class="sf-operator-agenda__toolbar">
      <input aria-label="Data" data-role="date" type="date" value="${esc(model.date)}">
      <button data-action="today">Oggi</button><button data-view="day" aria-pressed="${model.view === 'day'}">Giorno</button><button data-view="week" aria-pressed="${model.view === 'week'}">Settimana</button>
    </div>
    <div class="sf-operator-agenda__timeline">${model.days.map(day => `<section><h2>${esc(day.date)}</h2>${day.interventions.length ? day.interventions.map(item => `<button class="sf-operator-agenda__block" data-intervention-id="${esc(item.id)}"><time>${esc(item.startTime ?? item.time ?? '')}</time><strong>${esc(item.clientName ?? item.client ?? 'Intervento')}</strong><span>${esc(item.address ?? '')}</span><small>${esc(item.status ?? '')}</small></button>`).join('') : '<p>Nessun intervento assegnato.</p>'}</section>`).join('')}</div>
  </section>`;
}
