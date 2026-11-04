import { useRef, useState } from "react";
import FormField from "./FormField";
import { EDUCATION_LEVELS } from "../../../utils/profileOptions";
import { serverFieldErrors, serverMessage, validateEducation } from "../../../utils/profileValidation";

const toForm = (r) => ({
  level: r?.level ?? "",
  degreeName: r?.degreeName ?? "",
  specialization: r?.specialization ?? "",
  institution: r?.institution ?? "",
  university: r?.university ?? "",
  department: r?.department ?? "",
  startYear: r?.startYear == null ? "" : String(r.startYear),
  completionYear: r?.completionYear == null ? "" : String(r.completionYear),
  isCurrent: Boolean(r?.isCurrent),
  grade: r?.grade ?? "",
});

const FIELD_ORDER = ["level", "degreeName", "specialization", "institution", "university", "department", "startYear", "completionYear", "grade"];

export default function EducationForm({ record, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => toForm(record));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const change = (key, value) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busyRef.current) return;
    const found = validateEducation(values);
    setErrors(found);
    setFormError("");
    const first = FIELD_ORDER.find((k) => found[k]);
    if (first) {
      document.getElementById(`edu-${first}`)?.focus();
      return;
    }

    const text = (v) => String(v).trim();
    const payload = {
      level: values.level,
      degreeName: text(values.degreeName),
      specialization: text(values.specialization),
      institution: text(values.institution),
      university: text(values.university),
      department: text(values.department),
      startYear: Number(values.startYear),
      completionYear: values.isCurrent || values.completionYear === "" ? null : Number(values.completionYear),
      isCurrent: values.isCurrent,
      grade: text(values.grade),
    };

    busyRef.current = true;
    setBusy(true);
    try {
      await onSubmit(payload);
      onCancel(); // success: close the form
    } catch (err) {
      setErrors(serverFieldErrors(err));
      setFormError(serverMessage(err));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  return (
    <form className="sp-eduform" onSubmit={submit} noValidate aria-label={record ? "Edit qualification" : "Add qualification"}>
      <div className="sp-grid sp-grid--form">
        <FormField id="edu-level" label="Qualification level" as="select" options={EDUCATION_LEVELS} required value={values.level} error={errors.level} onChange={(e) => change("level", e.target.value)} />
        <FormField id="edu-degreeName" label="Degree name" required maxLength={150} value={values.degreeName} error={errors.degreeName} onChange={(e) => change("degreeName", e.target.value)} />
        <FormField id="edu-specialization" label="Specialization" maxLength={150} value={values.specialization} error={errors.specialization} onChange={(e) => change("specialization", e.target.value)} />
        <FormField id="edu-institution" label="College / Institution" required maxLength={150} value={values.institution} error={errors.institution} onChange={(e) => change("institution", e.target.value)} />
        <FormField id="edu-university" label="University" maxLength={150} value={values.university} error={errors.university} onChange={(e) => change("university", e.target.value)} />
        <FormField id="edu-department" label="Department" maxLength={150} value={values.department} error={errors.department} onChange={(e) => change("department", e.target.value)} />
        <FormField id="edu-startYear" label="Start year" type="number" required value={values.startYear} error={errors.startYear} onChange={(e) => change("startYear", e.target.value)} />
        <FormField id="edu-completionYear" label="Completion year" type="number" disabled={values.isCurrent} value={values.isCurrent ? "" : values.completionYear} error={errors.completionYear} onChange={(e) => change("completionYear", e.target.value)} />
        <FormField id="edu-grade" label="Grade / CGPA / Percentage" maxLength={30} hint="Optional, for example 8.5 CGPA or 82%." value={values.grade} error={errors.grade} onChange={(e) => change("grade", e.target.value)} />
        <div className="sp-field sp-check">
          <label htmlFor="edu-isCurrent">
            <input id="edu-isCurrent" type="checkbox" checked={values.isCurrent} onChange={(e) => change("isCurrent", e.target.checked)} /> Currently studying
          </label>
        </div>
      </div>
      {formError && <p className="sp-error" role="alert">{formError}</p>}
      <div className="sp-actions">
        <button type="submit" className="sd-btn sd-btn--primary" disabled={busy}>{busy ? "Saving…" : record ? "Save qualification" : "Add qualification"}</button>
        <button type="button" className="sd-btn" disabled={busy} onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}