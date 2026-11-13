// Zeichenfläche für Graphen: Koordinaten-Umrechnung, Gitter, Kurven, Punkte.
import { cssVar } from './ui.js';

export class Plot {
  /** view: {x0,x1,y0,y1}; die Höhe der Fläche ergibt sich aus dem Seitenverhältnis der Ansicht (gleiche Skalierung). */
  constructor(canvas, view, { equal = true, ratio = null } = {}) {
    this.c = canvas;
    this.v = view;
    this.ctx = canvas.getContext('2d');
    const r = ratio ?? (equal ? (view.x1 - view.x0) / (view.y1 - view.y0) : 2);
    canvas.style.aspectRatio = String(r);
    this.onResize = null;
    this.ro = new ResizeObserver(() => { this.resize(); this.onResize?.(); });
    this.ro.observe(canvas);
    this.resize();
  }
  destroy() { this.ro.disconnect(); }
  resize() {
    const r = this.c.getBoundingClientRect();
    const d = Math.min(window.devicePixelRatio || 1, 3);
    this.w = r.width || 300; this.h = r.height || 300;
    this.c.width = Math.round(this.w * d); this.c.height = Math.round(this.h * d);
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  X(x) { return ((x - this.v.x0) / (this.v.x1 - this.v.x0)) * this.w; }
  Y(y) { return this.h - ((y - this.v.y0) / (this.v.y1 - this.v.y0)) * this.h; }
  wx(px) { return this.v.x0 + (px / this.w) * (this.v.x1 - this.v.x0); }
  wy(py) { return this.v.y0 + ((this.h - py) / this.h) * (this.v.y1 - this.v.y0); }
  /** Zeiger-Ereignis → Weltkoordinaten. */
  at(ev) {
    const r = this.c.getBoundingClientRect();
    return { x: this.wx(ev.clientX - r.left), y: this.wy(ev.clientY - r.top), px: ev.clientX - r.left, py: ev.clientY - r.top };
  }
  clear() { this.ctx.clearRect(0, 0, this.w, this.h); }
  grid({ labels = true } = {}) {
    const g = this.ctx, v = this.v;
    g.lineWidth = 1; g.strokeStyle = cssVar('--grid');
    g.beginPath();
    for (let x = Math.ceil(v.x0); x <= v.x1; x++) { g.moveTo(this.X(x), 0); g.lineTo(this.X(x), this.h); }
    for (let y = Math.ceil(v.y0); y <= v.y1; y++) { g.moveTo(0, this.Y(y)); g.lineTo(this.w, this.Y(y)); }
    g.stroke();
    g.strokeStyle = cssVar('--axis'); g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(0, this.Y(0)); g.lineTo(this.w, this.Y(0));
    g.moveTo(this.X(0), 0); g.lineTo(this.X(0), this.h);
    g.stroke();
    if (labels) {
      g.fillStyle = cssVar('--axis'); g.font = '600 10px Inter, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'top';
      const stepX = (v.x1 - v.x0) > 9 ? 2 : 1;
      for (let x = Math.ceil(v.x0); x <= v.x1; x++) if (x !== 0 && x % stepX === 0 && x > v.x0 && x < v.x1) g.fillText(String(x), this.X(x), Math.min(this.Y(0) + 4, this.h - 12));
      g.textAlign = 'right'; g.textBaseline = 'middle';
      const stepY = (v.y1 - v.y0) > 9 ? 2 : 1;
      for (let y = Math.ceil(v.y0); y <= v.y1; y++) if (y !== 0 && y % stepY === 0 && y > v.y0 && y < v.y1) g.fillText(String(y), Math.max(this.X(0) - 5, 14), this.Y(y));
    }
  }
  fn(f, { color = cssVar('--curve'), width = 3, dash = null, x0 = this.v.x0, x1 = this.v.x1 } = {}) {
    const g = this.ctx;
    g.save(); g.strokeStyle = color; g.lineWidth = width; g.lineJoin = 'round'; g.lineCap = 'round';
    if (dash) g.setLineDash(dash);
    g.beginPath();
    let pen = false;
    const n = Math.max(80, Math.round(this.w));
    const pad = (this.v.y1 - this.v.y0) * 2;
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n, y = f(x);
      if (!Number.isFinite(y) || y > this.v.y1 + pad || y < this.v.y0 - pad) { pen = false; continue; }
      if (pen) g.lineTo(this.X(x), this.Y(y)); else { g.moveTo(this.X(x), this.Y(y)); pen = true; }
    }
    g.stroke(); g.restore();
  }
  seg(x1, y1, x2, y2, { color, width = 2, dash = null } = {}) {
    const g = this.ctx;
    g.save(); g.strokeStyle = color; g.lineWidth = width; g.lineCap = 'round';
    if (dash) g.setLineDash(dash);
    g.beginPath(); g.moveTo(this.X(x1), this.Y(y1)); g.lineTo(this.X(x2), this.Y(y2)); g.stroke(); g.restore();
  }
  dot(x, y, { r = 7, color, ring = null } = {}) {
    const g = this.ctx;
    g.save();
    if (ring) { g.fillStyle = ring; g.beginPath(); g.arc(this.X(x), this.Y(y), r + 4, 0, 7); g.fill(); }
    g.fillStyle = color; g.beginPath(); g.arc(this.X(x), this.Y(y), r, 0, 7); g.fill();
    g.restore();
  }
  star(x, y, { r = 11, color = '#ffb020', hollow = false } = {}) {
    const g = this.ctx, cx = this.X(x), cy = this.Y(y);
    g.save(); g.beginPath();
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 ? r * 0.45 : r, a = -Math.PI / 2 + (i * Math.PI) / 5;
      g[i ? 'lineTo' : 'moveTo'](cx + rad * Math.cos(a), cy + rad * Math.sin(a));
    }
    g.closePath();
    if (hollow) { g.strokeStyle = color; g.lineWidth = 2; g.globalAlpha = 0.55; g.stroke(); } else { g.fillStyle = color; g.fill(); }
    g.restore();
  }
  text(s, x, y, { color = cssVar('--muted'), align = 'left', font = '700 12px Inter, sans-serif', dx = 0, dy = 0 } = {}) {
    const g = this.ctx;
    g.save(); g.fillStyle = color; g.font = font; g.textAlign = align; g.textBaseline = 'middle';
    g.fillText(s, this.X(x) + dx, this.Y(y) + dy); g.restore();
  }
}
