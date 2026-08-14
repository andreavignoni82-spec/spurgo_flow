export class ReportSharing {
  constructor(navigatorObject = globalThis.navigator) { this.navigator = navigatorObject; }
  async share({ title = 'Rapportino Spurgo Flow', text = '', url, file } = {}) {
    const data = { title, text, ...(url ? { url } : {}), ...(file ? { files: [file] } : {}) };
    if (this.navigator?.share && (!file || !this.navigator.canShare || this.navigator.canShare({ files:[file] }))) {
      return this.navigator.share(data);
    }
    if (url && globalThis.open) { globalThis.open(url, '_blank'); return { fallback: 'url' }; }
    if (globalThis.location) { globalThis.location.href=`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`; return { fallback:'mailto' }; }
    return { fallback: 'none' };
  }
}
