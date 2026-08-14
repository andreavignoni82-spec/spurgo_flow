export function renderOperatorShell(container, { operator }) {
  container.innerHTML = `<main class="sf-operator"><header><strong>v7.0.0-alpha.11.1 · OPERATOR RELIABILITY</strong><span>${String(operator?.name ?? operator?.displayName ?? '')}</span></header><div data-role="operator-message" aria-live="polite"></div><div data-role="operator-content"></div></main>`;
  return container.querySelector('[data-role="operator-content"]');
}
