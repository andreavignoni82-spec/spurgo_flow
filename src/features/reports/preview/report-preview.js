import { reportTemplate } from './report-template.js';
export const renderReportPreview = (container, viewModel) => { container.innerHTML = reportTemplate(viewModel); return container.firstElementChild; };
