import { statusLabel } from "../../utils/attendanceFormat";

const TONE = { present: "ok", absent: "danger", leave: "info" };

export default function AttendanceStatusBadge({ status }) {
  if (!status) return <span className="sd-muted">Not marked</span>;
  return <span className={`sd-badge at-badge at-badge--${TONE[status]}`}>{statusLabel(status)}</span>;
}