import { useRef, useState } from "react";
import FormField from "../student/profile/FormField";
import { serverFieldErrors, serverMessage } from "../../utils/profileValidation";
import { formatMinor, validateStructure } from "../../utils/feeFormat";

const inr = (m) => (m === null || m === undefined ? "" : (m / 100).toFixed(2).replace(/\.00$/, ""));

/** Create (course chosen) or edit (course fixed). Existing students keep their snapshot; only new enrolments use the change. */
export default function FeeStructureForm({ courses, structure = null, onSubmit, onCancel }) {
  const editing = Boolean(structure);
  const [v, setV] = useState({ courseId: structure ? String(structure.courseId) : "", courseFee: inr(structure?.courseFeeMinor), discount: inr(structure?.discountMinor ?? 0), additional: inr(structure?.additionalMinor ?? 0), dueDate: structure?.dueDate || "", reason: "" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const set = (k, val) => { setV((x) => ({ ...x, [k]: val })); setErrors((e) => ({ ...e, [k]: undefined })); };

  const check = validateStructure(v);
  const total = check.courseFeeMinor !== null && check.discountMinor !== null && check.additionalMinor !== null && check.discountMinor <= check.courseFeeMinor
    ? check.courseFeeMinor - check.discountMinor + check.additionalMinor : null;

  const submit = async (e) => {
    e.preventDefault();
    if (busyRef.current) return;
    setErrors(check.errors); setError("");
    if (Object.keys(check.errors).length) return;
    busyRef.current = true; setBusy(true);
    try {
      const body = { courseFeeMinor: check.courseFeeMinor, discountMinor: check.discountMinor, additionalMinor: check.additionalMinor, dueDate: v.dueDate || null };
      await onSubmit(editing ? { ...body, reason: v.reason.trim() || undefined } : { ...body, courseId: Number(v.courseId) });
    } catch (err) { setErrors(serverFieldErrors(err)); setError(serverMessage(err)); }
    finally { busyRef.current = false; setBusy(false); }
  };

  return (
    <form className="sd-card lm-form" noValidate onSubmit={submit} aria-label={editing ? "Edit fee structure" : "New fee structure"}>
      <h2>{editing ? "Edit fee structure" : "New fee structure"}</h2>
      <p className="sd-muted">Students already enrolled keep the fee they were given. Changes apply to new enrolments only.</p>
      <div className="sp-grid sp-grid--form">
        <FormField id="fs-course" label="Course" as="select" required disabled={editing} value={v.courseId} error={errors.courseId} onChange={(e) => set("courseId", e.target.value)} options={[["", "Select a course"], ...courses.map((c) => [String(c.id), c.title])]} />
        <FormField id="fs-fee" label="Course fee (₹)" required inputMode="decimal" value={v.courseFee} error={errors.courseFee || errors.courseFeeMinor} onChange={(e) => set("courseFee", e.target.value)} />
        <FormField id="fs-discount" label="Discount (₹)" inputMode="decimal" value={v.discount} error={errors.discount || errors.discountMinor} onChange={(e) => set("discount", e.target.value)} />
        <FormField id="fs-additional" label="Additional charges (₹)" inputMode="decimal" value={v.additional} error={errors.additional || errors.additionalMinor} onChange={(e) => set("additional", e.target.value)} />
        <FormField id="fs-due" label="Payment due date" type="date" value={v.dueDate} error={errors.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
        {editing && <FormField id="fs-reason" label="Reason for change" maxLength={255} value={v.reason} error={errors.reason} onChange={(e) => set("reason", e.target.value)} />}
      </div>
      <p aria-live="polite"><strong>Total payable:</strong> {total === null ? "—" : formatMinor(total)}</p>
      {error && <p className="sp-error" role="alert">{error}</p>}
      <div className="sp-actions">
        <button type="submit" className="sd-btn sd-btn--primary" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Create fee structure"}</button>
        <button type="button" className="sd-btn" disabled={busy} onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}