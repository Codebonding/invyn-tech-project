export default function ProgressBar({ value = 0, label }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="sd-progress">
      <div className="sd-progress__track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={label || "Progress"}>
        <div className="sd-progress__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="sd-progress__pct">{pct}%</span>
    </div>
  );
}