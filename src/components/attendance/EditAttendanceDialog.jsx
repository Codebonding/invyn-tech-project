import { useEffect, useRef, useState } from "react";
import { STATUS_OPTIONS } from "../../utils/attendanceFormat";
import { serverMessage } from "../../utils/profileValidation";

/** Corrects one record. The server decides whether the caller may (employees: within the correction window). */
export default function EditAttendanceDialog({ record, onSave, onCancel }) {
  const [status, setStatus] = useState(record.status);
  const [remarks, setRemarks] = useState(record.remarks || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const first = useRef(null);

  useEffect(() => {
    first.current?.focus();
    const onKey = (e) => { if (e.key === "Escape" && !busy) onCancel(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    if (remarks.length > 255) { setError("Remarks must be 255 characters or fewer."); return; }
    setBusy(true);
    setError("");
    try {
      await onSave({ status, remarks: remarks.trim() });
    } catch (err) {
      setError(serverMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sp-overlay">
      <form className="sp-dialog" role="dialog" aria-modal="true" aria-labelledby="at-edit-title" onSubmit={submit}>
        <h2 id="at-edit-title">Correct attendance</h2>
        <p className="sd-muted">{record.student?.name} · {record.session?.title} · {record.attendanceDate}</p>
        <fieldset className="at-radios">
          <legend className="visually-hidden">Status</legend>
          {STATUS_OPTIONS.map(([id, label], i) => (
            <label key={id} className={`at-radio at-radio--${id} ${status === id ? "is-on" : ""}`}>
              <input ref={i === 0 ? first : undefined} type="radio" name="edit-status" value={id} checked={status === id} onChange={() => setStatus(id)} />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>
        <div className="sp-field">
          <label htmlFor="at-edit-remarks">Remarks</label>
          <input id="at-edit-remarks" className="sp-input" maxLength={255} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
        </div>
        {error && <p className="sp-error" role="alert">{error}</p>}
        <div className="sp-actions">
          <button type="submit" className="sd-btn sd-btn--primary" disabled={busy}>{busy ? "Saving…" : "Save correction"}</button>
          <button type="button" className="sd-btn" disabled={busy} onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}