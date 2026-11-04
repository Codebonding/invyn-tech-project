import { useEffect, useRef, useState } from "react";
import FormField from "./FormField";
import { serverFieldErrors, serverMessage } from "../../../utils/profileValidation";

const toForm = (source, fields) =>
  Object.fromEntries(fields.filter((f) => !f.readOnly).map((f) => [f.key, source[f.key] == null ? "" : String(source[f.key])]));

/**
 * One card that switches between a read-only list and a form (Edit / Save changes / Cancel).
 * Shows "Not provided" for empty optional fields, runs the client validator before sending, shows field-level
 * errors (client or server), and ignores a second submit while one is in flight.
 */
export default function EditableFieldsCard({ id, title, fields, source, validate, onSave, editing, onEditingChange }) {
  const [values, setValues] = useState(() => toForm(source, fields));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  // Leaving edit mode (Cancel or after saving) always resets the form to the stored values.
  useEffect(() => {
    if (!editing) {
      setValues(toForm(source, fields));
      setErrors({});
      setFormError("");
    }
  }, [source, fields, editing]);

  const change = (key, value) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busyRef.current) return;

    const found = validate(values);
    setErrors(found);
    setFormError("");
    const firstInvalid = fields.find((f) => found[f.key]);
    if (firstInvalid) {
      document.getElementById(`${id}-${firstInvalid.key}`)?.focus();
      return;
    }

    busyRef.current = true;
    setBusy(true);
    try {
      await onSave(values);
      onEditingChange(false);
    } catch (err) {
      setErrors(serverFieldErrors(err));
      setFormError(serverMessage(err));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const headingId = `${id}-heading`;

  return (
    <section id={id} className="sd-card sp-section" aria-labelledby={headingId}>
      <div className="sp-section__head">
        <h2 id={headingId}>{title}</h2>
        {!editing && (
          <button type="button" className="sd-btn sd-btn--sm" onClick={() => onEditingChange(true)} aria-label={`Edit ${title.toLowerCase()}`}>
            Edit
          </button>
        )}
      </div>

      {!editing ? (
        <dl className="sp-grid">
          {fields.map((f) => {
            const raw = source[f.key];
            const shown = f.format ? f.format(raw) : raw;
            const empty = shown === null || shown === undefined || shown === "";
            return (
              <div key={f.key}>
                <dt>{f.label}</dt>
                <dd className={empty ? "is-empty" : ""}>{empty ? "Not provided" : shown}</dd>
              </div>
            );
          })}
        </dl>
      ) : (
        <form onSubmit={submit} noValidate>
          <div className="sp-grid sp-grid--form">
            {fields.map((f) =>
              f.readOnly ? (
                <div key={f.key} className="sp-field">
                  <span className="sp-label">{f.label}</span>
                  <p className="sp-readonly">{source[f.key]}</p>
                  {f.hint && <p className="sd-muted">{f.hint}</p>}
                </div>
              ) : (
                <FormField
                  key={f.key}
                  id={`${id}-${f.key}`}
                  label={f.label}
                  as={f.as}
                  options={f.options}
                  type={f.type}
                  required={f.required}
                  maxLength={f.maxLength}
                  min={f.min}
                  max={f.max}
                  autoComplete={f.autoComplete}
                  hint={f.hint}
                  error={errors[f.key]}
                  value={values[f.key]}
                  onChange={(e) => change(f.key, e.target.value)}
                />
              )
            )}
          </div>
          {formError && <p className="sp-error" role="alert">{formError}</p>}
          <div className="sp-actions">
            <button type="submit" className="sd-btn sd-btn--primary" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
            <button type="button" className="sd-btn" disabled={busy} onClick={() => onEditingChange(false)}>Cancel</button>
          </div>
        </form>
      )}
    </section>
  );
}