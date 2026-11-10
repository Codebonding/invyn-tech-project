import { formatDate, formatTime } from "../../utils/studentFormat";
import AttendanceStatusBadge from "./AttendanceStatusBadge";

/** Staff table. Delete is offered to admins only (the API refuses everyone else). */
export default function RecordsTable({ items, isAdmin, onEdit, onDelete }) {
  return (
    <div className="lm-table-wrap">
      <table className="lm-table">
        <caption className="visually-hidden">Attendance records</caption>
        <thead>
          <tr>
            <th scope="col">Date</th><th scope="col">Student</th><th scope="col">Course</th><th scope="col">Session</th>
            <th scope="col">Status</th><th scope="col">Remarks</th><th scope="col">Marked by</th>{(onEdit || onDelete) && <th scope="col">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id}>
              <td data-label="Date">{formatDate(r.attendanceDate)}</td>
              <td data-label="Student"><strong>{r.student?.name}</strong><span className="sd-muted"> {r.student?.studentId}</span></td>
              <td data-label="Course">{r.courseTitle}</td>
              <td data-label="Session">{r.session?.title}<span className="sd-muted"> {formatTime(r.session?.startsAt)}</span></td>
              <td data-label="Status"><AttendanceStatusBadge status={r.status} /></td>
              <td data-label="Remarks">{r.remarks || "—"}</td>
              <td data-label="Marked by">
                {r.markedBy?.name || "—"}
                {r.updatedBy && r.updatedBy.id !== r.markedBy?.id && <span className="sd-muted"> · changed by {r.updatedBy.name}</span>}
              </td>
              {(onEdit || onDelete) && (
                <td data-label="Actions">
                  <div className="lm-actions">
                    {onEdit && <button type="button" className="sd-btn sd-btn--sm" onClick={() => onEdit(r)} aria-label={`Correct attendance for ${r.student?.name} on ${r.attendanceDate}`}>Correct</button>}
                    {isAdmin && onDelete && <button type="button" className="sd-btn sd-btn--sm lm-danger" onClick={() => onDelete(r)} aria-label={`Delete attendance for ${r.student?.name} on ${r.attendanceDate}`}>Delete</button>}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}