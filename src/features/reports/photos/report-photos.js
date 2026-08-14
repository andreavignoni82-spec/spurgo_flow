import { normalizePhoto } from './report-photos.model.js';

export class ReportPhotos {
  #urls = new Set();
  select(files, category = 'FOTO') {
    return [...(files ?? [])].map(file => {
      const previewUrl = URL.createObjectURL(file); this.#urls.add(previewUrl);
      return normalizePhoto({ id: globalThis.crypto?.randomUUID?.(), data: previewUrl, category, at: new Date().toISOString(), name: file.name, type: file.type, size: file.size, file });
    });
  }
  release(photo) { if (photo?.data && this.#urls.delete(photo.data)) URL.revokeObjectURL(photo.data); }
  destroy() { this.#urls.forEach(url => URL.revokeObjectURL(url)); this.#urls.clear(); }
}
