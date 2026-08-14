export class SignaturePad {
  #canvas; #context; #drawing = false; #signed = false; #off = [];
  constructor(canvas) {
    if (!canvas?.getContext) throw new Error('Canvas firma non disponibile');
    this.#canvas = canvas; this.#context = canvas.getContext('2d'); this.#resize(); this.#bind();
  }
  clear() { this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height); this.#signed = false; }
  isEmpty() { return !this.#signed; }
  exportImage(type = 'image/png') { if (this.isEmpty()) throw new Error('Firma non acquisita.'); return this.#canvas.toDataURL(type); }
  destroy() { this.#off.splice(0).forEach(off => off()); this.#drawing = false; }
  #resize() {
    const rect = this.#canvas.getBoundingClientRect(); const ratio = globalThis.devicePixelRatio || 1;
    this.#canvas.width = Math.max(1, Math.round((rect.width || 300) * ratio));
    this.#canvas.height = Math.max(1, Math.round((rect.height || 120) * ratio));
    this.#context.setTransform(ratio, 0, 0, ratio, 0, 0); this.#context.lineWidth = 2;
    this.#context.lineCap = 'round'; this.#context.strokeStyle = '#0b2948';
  }
  #point(event) { const rect=this.#canvas.getBoundingClientRect(); return { x:event.clientX-rect.left, y:event.clientY-rect.top }; }
  #listen(name, handler) { this.#canvas.addEventListener(name, handler); this.#off.push(() => this.#canvas.removeEventListener(name, handler)); }
  #bind() {
    this.#listen('pointerdown', event => { this.#drawing=true; const p=this.#point(event); this.#context.beginPath(); this.#context.moveTo(p.x,p.y); this.#canvas.setPointerCapture?.(event.pointerId); event.preventDefault(); });
    this.#listen('pointermove', event => { if(!this.#drawing)return; const p=this.#point(event); this.#context.lineTo(p.x,p.y); this.#context.stroke(); this.#signed=true; event.preventDefault(); });
    const up = event => { this.#drawing=false; event.preventDefault(); };
    this.#listen('pointerup', up); this.#listen('pointercancel', up); this.#listen('pointerleave', up);
  }
}
