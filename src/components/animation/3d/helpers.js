import * as THREE from "three";

export const C = { blue: "#0B9AF0", primary: "#031982", navy: "#132C48", royal: "#023DE3", ice: "#8CD6FF", white: "#F4F8FF" };

export const clamp = THREE.MathUtils.clamp;
export const damp = (cur, tgt, k, dt) => cur + (tgt - cur) * (1 - Math.exp(-k * dt));
export const easeOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
export const disposeAll = (...items) => items.flat().forEach((i) => i && i.dispose && i.dispose());

export function fibonacciSphere(n, r) {
  const out = [];
  const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = n === 1 ? 0 : 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(Math.max(0, 1 - y * y));
    const th = ga * i;
    out.push(new THREE.Vector3(Math.cos(th) * rad * r, y * r, Math.sin(th) * rad * r));
  }
  return out;
}

function canvasTexture(w, h, draw) {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  if (!g) return null;
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export const makeBadgeTexture = (text) =>
  canvasTexture(128, 128, (g, w, h) => {
    const r = w / 2 - 6;
    const fill = g.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, r);
    fill.addColorStop(0, "#0333B7");
    fill.addColorStop(1, "#132C48");
    g.fillStyle = fill;
    g.beginPath(); g.arc(w / 2, h / 2, r, 0, Math.PI * 2); g.fill();
    const ring = g.createLinearGradient(0, 0, w, h);
    ring.addColorStop(0, "#0B9AF0");
    ring.addColorStop(1, "#8CD6FF");
    g.strokeStyle = ring; g.lineWidth = 6;
    g.beginPath(); g.arc(w / 2, h / 2, r, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "#F4F8FF";
    g.font = "700 46px system-ui, sans-serif";
    g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(text, w / 2, h / 2 + 3);
  });

export function makeLabelTexture(text, size = 34) {
  const w = Math.max(160, Math.ceil(text.length * size * 0.62) + 56);
  const h = 76;
  const t = canvasTexture(w, h, (g) => {
    g.fillStyle = "rgba(19,44,72,0.92)";
    g.strokeStyle = "rgba(140,214,255,0.7)";
    g.lineWidth = 3;
    g.beginPath(); g.roundRect(3, 3, w - 6, h - 6, 24); g.fill(); g.stroke();
    g.fillStyle = "#F4F8FF";
    g.font = `600 ${size}px system-ui, sans-serif`;
    g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(text, w / 2, h / 2 + 2);
  });
  if (t) t.userData.aspect = w / h;
  return t;
}

export const makeGlowTexture = () =>
  canvasTexture(128, 128, (g, w, h) => {
    const grad = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.25, "rgba(140,214,255,0.55)");
    grad.addColorStop(1, "rgba(11,154,240,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  });