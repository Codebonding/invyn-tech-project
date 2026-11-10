import { STATUS_OPTIONS } from "../../utils/attendanceFormat";

/**
 * values: { [studentId]: { status, remarks } }. Rows in `lockedIds` are read-only (for example, an employee viewing a
 * record outside the correction window). The server enforces the same rules.
 */
export default function RosterTable({ students, values, lockedIds, onChange }) {
  return (
    <div className="lm-table-wrap">
      <table className="lm-table at-roster">
        <caption className="visually-hidden">Enrolled students</caption>
        <thead>
          <tr><th scope="col">Student ID</th><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Attendance</th><th scope="col">Remarks</th></tr>
        </thead>
        <tbody>
          {students.map((s) => {
            const v = values[s.id] || { status: "", remarks: "" };
            const locked = lockedIds.has(s.id);
            return (
              <tr key={s.id}>
                <td data-label="Student ID">{s.studentId}</td>
                <td data-label="Name"><strong>{s.name}</strong>{locked && <span className="sd-muted"> · locked</span>}</td>
                <td data-label="Email">{s.email}</td>
                <td data-label="Attendance">
                  <fieldset className="at-radios" disabled={locked}>
                    <legend className="visually-hidden">Attendance for {s.name}</legend>
                    {STATUS_OPTIONS.map(([id, label]) => (
                      <label key={id} className={`at-radio at-radio--${id} ${v.status === id ? "is-on" : ""}`}>
                        <input type="radio" name={`status-${s.id}`} value={id} checked={v.status === id} onChange={() => onChange(s.id, { status: id })} />
                        <span>{label}</span>
                      </label>
                    ))}
                  </fieldset>
                </td>
                <td data-label="Remarks">
                  <input type="text" className="sp-input" maxLength={255} aria-label={`Remarks for ${s.name}`} value={v.remarks} disabled={locked} placeholder="Optional" onChange={(e) => onChange(s.id, { remarks: e.target.value })} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}