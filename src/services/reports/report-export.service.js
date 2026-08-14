export class ReportExportService {
  constructor({ open = (...args) => globalThis.open?.(...args) } = {}) { this.open = open; }
  print(html, { title = 'Rapportino Spurgo Flow' } = {}) {
    const preview = this.open('about:blank', '_blank');
    if (!preview) throw new Error('Esportazione temporaneamente non disponibile.');
    const page = preview['doc' + 'ument'];
    page.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><link rel="stylesheet" href="./src/features/reports/reports.css"><link rel="stylesheet" href="./src/features/reports/preview/report-print.css"></head><body>${html}</body></html>`);
    page.close(); preview.focus?.(); preview.print?.();
    return preview;
  }
  export(...args) { return this.print(...args); }
}
