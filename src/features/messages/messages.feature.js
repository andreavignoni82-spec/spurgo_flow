import { newOfficeMessage } from '../../shared/models/message.js';
import { filterMessages } from './messages.model.js';
import { renderMessages } from './messages.view.js';

const POLL_MS = 30000;
const id = () => globalThis.crypto?.randomUUID?.() || `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export class MessagesFeature {
  id = 'messages';
  #container; #context; #messages = []; #operators = []; #teams = []; #selectedId = ''; #draft = ''; #error = ''; #fatalError = false; #sending = false; #timer; #off = [];
  async mount(container, context) {
    this.unmount(); this.#container = container; this.#context = context;
    for (const event of ['message:created', 'message:updated', 'message:read']) this.#off.push(context.eventBus.on(event, () => { if (this.#container) void this.refresh(); }));
    this.#timer = globalThis.setInterval(() => { if (this.#container) void this.refresh(); }, POLL_MS);
    await this.refresh();
  }
  unmount() { if (this.#timer) globalThis.clearInterval(this.#timer); this.#timer = undefined; this.#off.splice(0).forEach(off => off()); this.#container = undefined; this.#context = undefined; }
  async refresh() {
    try {
      const repositories = this.#context.repositories;
      [this.#messages, this.#operators, this.#teams] = await Promise.all([repositories.messages.list(), repositories.operators.list(), repositories.teams.list()]);
      this.#fatalError = false; this.#render();
    } catch { this.#fatalError = true; this.#render(); }
  }
  #select = selectedId => { this.#selectedId = String(selectedId); this.#error = ''; this.#render(); void this.#markRead(); };
  #setDraft = draft => { this.#draft = draft; };
  #submit = async () => {
    if (this.#sending || !this.#selectedId || !this.#draft.trim()) return;
    this.#sending = true; this.#error = ''; this.#render();
    try {
      const saved = await this.#context.repositories.messages.create(newOfficeMessage({ id: id(), operatorId: this.#selectedId, text: this.#draft.trim(), createdAt: new Date().toISOString() }));
      this.#draft = ''; await this.refresh(); this.#context.eventBus.emit('message:created', { id: saved.id });
    } catch (error) { this.#error = `Messaggio non inviato: ${error?.message || error}`; }
    finally { this.#sending = false; this.#render(); }
  };
  #markRead = async () => {
    if (!this.#selectedId) return;
    const unread = filterMessages(this.#messages, { recipientType: 'operator', recipientId: this.#selectedId }).filter(message => message.from === 'operator' && !message.readByOffice);
    try { for (const message of unread) { await this.#context.repositories.messages.markRead(message.id, 'office'); this.#context.eventBus.emit('message:read', { id: message.id }); } if (unread.length) await this.refresh(); }
    catch (error) { this.#error = `Lettura non aggiornata: ${error?.message || error}`; this.#render(); }
  };
  #render() {
    if (!this.#container) return;
    const operators = this.#operators.filter(operator => operator.active !== false).map(operator => ({ ...operator, unread: this.#messages.filter(message => String(message.operatorId) === String(operator.id) && message.from === 'operator' && !message.readByOffice).length }));
    const selected = operators.find(operator => String(operator.id) === this.#selectedId);
    renderMessages(this.#container, { operators, teams: this.#teams, selectedId: this.#selectedId, selectedName: selected && (selected.name || selected.nome || `${selected.nome || ''} ${selected.cognome || ''}`.trim() || selected.id), selectedRole: selected?.ruolo || '', messages: filterMessages(this.#messages, { recipientType: 'operator', recipientId: this.#selectedId }), draft: this.#draft, sending: this.#sending, error: this.#error, fatalError: this.#fatalError, formatDate: value => value ? new Date(value).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '' }, { select: this.#select, draft: this.#setDraft, submit: this.#submit, markRead: this.#markRead });
    this.#container.querySelector('.sf-messages-list')?.scrollTo({ top: 999999 });
  }
}
export const messagesFeature = new MessagesFeature();
