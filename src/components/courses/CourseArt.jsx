export default function CourseArt({ category = "" }) {
  const seed = [...category].reduce((a, c) => a + c.charCodeAt(0), 0) || 7;
  const pts = Array.from({ length: 6 }, (_, i) => [
    40 + ((seed * (i + 3) * 37) % 320),
    30 + ((seed * (i + 5) * 53) % 160),
  ]);
  const id = `art-${seed}`;
  return (
    <svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" width="100%" height="100%">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#031982" />
          <stop offset="0.55" stopColor="#023DE3" />
          <stop offset="1" stopColor="#0B9AF0" />
        </linearGradient>
      </defs>
      <rect width="400" height="225" fill={`url(#${id})`} />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="225" stroke="#8CD6FF" strokeOpacity=".08" />
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 50} x2="400" y2={i * 50} stroke="#8CD6FF" strokeOpacity=".08" />
      ))}
      <circle cx={pts[0][0]} cy={pts[0][1]} r="90" fill="#8CD6FF" fillOpacity=".10" />
      <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="#8CD6FF" strokeOpacity=".55" strokeWidth="1.5" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 ? 5 : 8} fill="#fff" fillOpacity={i % 2 ? 0.55 : 0.9} />
      ))}
    </svg>
  );
}