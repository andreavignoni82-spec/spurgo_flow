import { renderOperators } from './operators/operators.view.js';
import { renderTeams } from './teams/teams.view.js';

export function renderPeople(container, state) {
  container.innerHTML = `<div class="sf-people"><header><div><h1>Operatori & Squadre</h1><p>Anagrafiche, account, squadre e disponibilità restano responsabilità separate.</p></div><b>v7.0.0-alpha.5 · PEOPLE MODULE</b></header><div class="sf-people-grid">${renderOperators({ ...state, form: state.operatorForm, saving: state.operatorSaving, error: state.operatorError, errors: state.operatorErrors })}${renderTeams({ ...state, form: state.teamForm, saving: state.teamSaving, error: state.teamError })}</div></div>`;
}

export function renderPeopleFailure(container) { container.innerHTML = '<div class="sf-people sf-people-error-boundary">Modulo Operatori & Squadre temporaneamente non disponibile</div>'; }
