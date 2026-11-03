import ProgressBar from "./ProgressBar";

export default function StatCard({ label, value, hint, progress }) {
  return (
    <div className="sd-card sd-stat">
      <p className="sd-stat__label">{label}</p>
      <p className="sd-stat__value">{progress === undefined ? value : `${value}%`}</p>
      {progress !== undefined ? <ProgressBar value={progress} label={label} /> : hint && <p className="sd-muted">{hint}</p>}
    </div>
  );
}