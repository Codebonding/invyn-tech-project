export function StaticConstellation({ techs, activeId }) {
  const n = techs.length;
  return (
    <svg className="inv-static" viewBox="0 0 600 420" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="sc-core"><stop offset="0" stopColor="#8CD6FF" /><stop offset="1" stopColor="#0B9AF0" stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx="300" cy="210" r="120" fill="url(#sc-core)" opacity=".5" />
      {techs.map((t, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = 300 + Math.cos(a) * 230;
        const y = 210 + Math.sin(a) * 150;
        const on = t.id === activeId;
        return (
          <g key={t.id}>
            <line x1="300" y1="210" x2={x} y2={y} stroke={on ? "#8CD6FF" : "#1d4f8f"} strokeWidth={on ? 2 : 1} />
            <circle cx={x} cy={y} r={on ? 26 : 22} fill="#132C48" stroke={on ? "#8CD6FF" : "#0B9AF0"} strokeWidth="2" />
            <text x={x} y={y + 5} textAnchor="middle" fill="#F4F8FF" fontSize="14" fontWeight="700">{t.glyph}</text>
          </g>
        );
      })}
      <circle cx="300" cy="210" r="30" fill="#0B9AF0" opacity=".9" />
      <text x="300" y="215" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700" letterSpacing="1">INVYN</text>
    </svg>
  );
}

const iso = (x, y, z = 0) => [200 + (x - y) * 26, 150 + (x + y) * 15 - z * 30];
const pt = (p) => p.map((v) => v.toFixed(1)).join(",");
function Box({ x, y, w, d, h, z = 0, top = "#0B9AF0", left = "#023DE3", right = "#031982" }) {
  const A = iso(x, y, z + h), B = iso(x + w, y, z + h), Cc = iso(x + w, y + d, z + h), D = iso(x, y + d, z + h);
  const E = iso(x, y + d, z), F = iso(x + w, y + d, z), G = iso(x + w, y, z);
  return (
    <g>
      <polygon points={[D, Cc, F, E].map(pt).join(" ")} fill={left} />
      <polygon points={[Cc, B, G, F].map(pt).join(" ")} fill={right} />
      <polygon points={[A, B, Cc, D].map(pt).join(" ")} fill={top} />
    </g>
  );
}

export function IsoIllustration({ kind = "web" }) {
  const bars = [0.8, 1.6, 1.1, 2.1, 1.4];
  return (
    <svg className="inv-static" viewBox="0 0 400 300" aria-hidden="true" focusable="false">
      <Box x={0} y={0} w={6} d={6} h={0.4} top="#1b3d63" left="#132C48" right="#0d2038" />
      {kind === "web" && (<><Box x={1} y={2.4} w={4} d={0.4} h={3} z={0.4} top="#8CD6FF" /><Box x={1.4} y={2.6} w={1.6} d={0.3} h={0.8} z={1.4} /></>)}
      {kind === "dashboard" && bars.map((h, i) => <Box key={i} x={0.8 + i * 1} y={2.5} w={0.7} d={0.7} h={h} z={0.4} top={i % 2 ? "#8CD6FF" : "#0B9AF0"} />)}
      {kind === "mobile" && (<><Box x={2.4} y={2.3} w={1.3} d={0.4} h={3.2} z={0.4} top="#8CD6FF" /><Box x={4.2} y={3} w={0.8} d={0.4} h={1} z={0.4} /></>)}
      {kind === "cloud" && [0, 1, 2].map((i) => <Box key={i} x={1.5} y={1.8} w={3} d={2.2} h={0.55} z={0.4 + i * 0.75} top={i === 1 ? "#0B9AF0" : "#1b3d63"} />)}
      {kind === "ai" && (<><Box x={2.3} y={2.3} w={1.4} d={1.4} h={1.4} z={0.4} top="#8CD6FF" />{[[0.6, 0.8], [4.4, 0.8], [0.6, 4.2], [4.4, 4.2]].map(([x, y], i) => <Box key={i} x={x} y={y} w={0.7} d={0.7} h={0.7} z={0.4} />)}</>)}
    </svg>
  );
}

export function StaticCore({ active = -1 }) {
  const layers = [["INNOVATE", 70, 0.72], ["BUILD", 120, 0.84], ["PRACTICE", 170, 0.94], ["LEARN", 220, 1]];
  return (
    <svg className="inv-static" viewBox="0 0 440 340" aria-hidden="true" focusable="false">
      <defs><radialGradient id="why-core"><stop offset="0" stopColor="#8CD6FF" /><stop offset="1" stopColor="#0B9AF0" stopOpacity="0" /></radialGradient></defs>
      <circle cx="220" cy="170" r="110" fill="url(#why-core)" opacity=".45" />
      {layers.map(([name, y, s], i) => {
        const on = active === 3 - i;
        return (
          <g key={name}>
            <ellipse cx="220" cy={y + 20} rx={150 * s} ry={34 * s} fill="rgba(11,154,240,.08)" stroke={on ? "#8CD6FF" : "#0B9AF0"} strokeWidth={on ? 3 : 1.5} />
            <text x={220 + 150 * s + 8} y={y + 24} fill="#B9C8DC" fontSize="11" fontWeight="600">{name}</text>
          </g>
        );
      })}
      <circle cx="220" cy="170" r="22" fill="#0B9AF0" />
    </svg>
  );
}

export function StaticPortal() {
  return (
    <div className="inv-static-portal" aria-hidden="true">
      <span /><span /><span />
    </div>
  );
}