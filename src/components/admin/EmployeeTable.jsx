import { useState } from "react";

const when = (iso) => (iso ? new Date(iso).toLocaleString() : "Never");

function EmployeeRow({ employee, busy, onRename, onToggle, onResend, onDelete, onToggleCourses }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(employee.name);

  const save = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) return;
    if (trimmed !== employee.name) {
      const ok = await onRename(employee.id, trimmed);
      if (!ok) return;
    }
    setEditing(false);
  };

  const cancel = () => { setName(employee.name); setEditing(false); };
  const invited = employee.status === "invited";
  const active = employee.status === "active";

  return (
    <tr>
      <td>
        {editing ? (
          <input className="inv-cf__control" value={name} onChange={(e) => setName(e.target.value)} aria-label={`Name for ${employee.email}`} maxLength={100} />
        ) : employee.name}
      </td>
      <td>{employee.email}</td>
      <td><span className={`inv-admin__badge inv-admin__badge--${employee.status}`}>{employee.status}</span></td>
      <td>
        <span className={`inv-admin__badge inv-admin__badge--${employee.canManageCourses ? "active" : "inactive"}`}>
          {employee.canManageCourses ? "allowed" : "no access"}
        </span>
      </td>
      <td className="inv-admin__muted">{when(employee.lastLoginAt)}</td>
      <td>
        <div className="inv-admin__actions">
          {editing ? (
            <>
              <button type="button" className="inv-btn inv-btn--primary inv-btn--sm" onClick={save} disabled={busy}>Save</button>
              <button type="button" className="inv-btn inv-btn--outline inv-btn--sm" onClick={cancel} disabled={busy}>Cancel</button>
            </>
          ) : (
            <>
              <button type="button" className="inv-btn inv-btn--outline inv-btn--sm" onClick={() => setEditing(true)} disabled={busy}>Edit</button>
              {invited ? (
                <button type="button" className="inv-btn inv-btn--outline inv-btn--sm" onClick={() => onResend(employee)} disabled={busy}>Resend invite</button>
              ) : (
                <button type="button" className="inv-btn inv-btn--outline inv-btn--sm" onClick={() => onToggle(employee)} disabled={busy}>
                  {active ? "Deactivate" : "Activate"}
                </button>
              )}
              <button type="button" className="inv-btn inv-btn--outline inv-btn--sm" onClick={() => onToggleCourses(employee)} disabled={busy}>
                {employee.canManageCourses ? "Revoke courses" : "Allow courses"}
              </button>
              <button type="button" className="inv-btn inv-btn--outline inv-btn--sm inv-admin__danger" onClick={() => onDelete(employee)} disabled={busy}>Delete</button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function EmployeeTable({ employees, busyId, onRename, onToggle, onResend, onDelete, onToggleCourses }) {
  return (
    <div className="inv-admin__tablewrap">
      <table className="inv-admin__table">
        <caption className="visually-hidden">Employees</caption>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Status</th>
            <th scope="col">Courses</th>
            <th scope="col">Last login</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((e) => (
            <EmployeeRow key={e.id} employee={e} busy={busyId === e.id} onRename={onRename} onToggle={onToggle} onResend={onResend} onDelete={onDelete} onToggleCourses={onToggleCourses} />
          ))}
        </tbody>
      </table>
    </div>
  );
}