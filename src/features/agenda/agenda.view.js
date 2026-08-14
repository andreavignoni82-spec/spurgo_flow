const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
const colorStyle = color => `--agenda-bg:${color.bg};--agenda-border:${color.border};--agenda-ink:${color.ink}`;
const timeLabel = intervention => {
  const start = intervention.startTime || intervention.time || '';
  const end = intervention.endTime || intervention.timeEnd || '';
  return start && end ? `${start} – ${end}` : start || end || 'Orario da definire';
};
const blockDetails = intervention => [intervention.type || intervention.request || 'Intervento', intervention.priority, intervention.status].filter(Boolean).join(' · ');

function renderDay(model) {
  const hours = Array.from({ length: 15 }, (_, index) => index + 6);
  const head = `<div class="sf-agenda-timeline-head"><div class="sf-agenda-resource sf-agenda-resource-head">Operatore / squadra</div><div class="sf-agenda-hour-axis">${hours.map((hour, index) => `<span class="sf-agenda-hour" style="left:${index * 80}px">${String(hour).padStart(2, '0')}:00</span>`).join('')}</div></div>`;
  const body = model.resources.map(resource => {
    const height = Math.max(72, resource.laneCount * 62 + 10);
    const style = colorStyle(resource.color);
    const blocks = resource.blocks.map(({ intervention, lane, left, width }) => `<button type="button" class="sf-agenda-block" data-intervention-id="${escapeHtml(intervention.id)}" style="left:${left}px;width:${width}px;top:${8 + lane * 62}px;${style}" title="${escapeHtml(intervention.clientName || intervention.client || 'Intervento')}"><time>${escapeHtml(timeLabel(intervention))}</time><strong>${escapeHtml(intervention.clientName || intervention.client || 'Cliente da definire')}</strong><small>${escapeHtml(blockDetails(intervention))}</small></button>`).join('');
    return `<div class="sf-agenda-timeline-row" style="min-height:${height}px;${style}"><div class="sf-agenda-resource" style="${style}"><strong>${escapeHtml(resource.name)}</strong><small>${escapeHtml(resource.meta)}</small></div><div class="sf-agenda-track" style="min-height:${height}px;--agenda-row:${resource.color.bg}55">${blocks}</div></div>`;
  }).join('');
  return `<div class="sf-agenda-scroll"><div class="sf-agenda-timeline">${head}${body || '<div class="sf-agenda-empty">Nessun operatore o squadra disponibile.</div>'}</div></div>`;
}

function renderWeek(model) {
  return `<div class="sf-agenda-week-grid">${model.days.map(day => `<section class="sf-agenda-week-day"><h3>${new Date(`${day.date}T12:00:00`).toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: '2-digit' })}</h3>${day.interventions.map(intervention => {
    const color = intervention.teamId ? model.color(`team:${intervention.teamId}`) : model.color(`operator:${intervention.assignedOperatorIds?.[0] || intervention.operatorId || 'unassigned'}`);
    return `<button type="button" class="sf-agenda-block sf-agenda-week-block" data-intervention-id="${escapeHtml(intervention.id)}" style="${colorStyle(color)}"><time>${escapeHtml(timeLabel(intervention))}</time><strong>${escapeHtml(intervention.clientName || intervention.client || 'Cliente da definire')}</strong><small>${escapeHtml(blockDetails(intervention))}</small></button>`;
  }).join('') || '<div class="sf-agenda-empty">Nessun intervento</div>'}</section>`).join('')}</div>`;
}

export function renderAgenda(container, { view, date, dayModel, weekModel, color }) {
  container.innerHTML = `<div class="sf-agenda"><div class="sf-agenda-toolbar"><input class="sf-agenda-date" data-role="date" type="date" value="${escapeHtml(date)}" aria-label="Data agenda"><button type="button" class="sf-agenda-today" data-action="today">Oggi</button><div class="sf-agenda-view-switch"><button type="button" data-view="day" class="${view === 'day' ? 'active' : ''}">Giorno</button><button type="button" data-view="week" class="${view === 'week' ? 'active' : ''}">Settimana</button></div></div>${view === 'week' ? renderWeek({ ...weekModel, color }) : renderDay(dayModel)}</div>`;
}
