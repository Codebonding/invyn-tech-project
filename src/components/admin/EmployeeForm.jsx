import { useRef, useState } from "react";
import { toFormErrors, validateEmployee } from "../../utils/authValidation";

const FIELDS = [
  { name: "name", label: "Full name", type: "text", autoComplete: "off" },
  { name: "email", label: "Work email", type: "email", autoComplete: "off" },
];

export default function EmployeeForm({ onSubmit, onCancel, isLoading }) {
  const submitting = useRef(false);
  const [values, setValues] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (submitting.current) return;
    setFormError(null);

    const found = validateEmployee(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    submitting.current = true;
    try {
      await onSubmit({ name: values.name.trim(), email: values.email.trim() });
    } catch (error) {
      const result = toFormErrors(error);
      setErrors(result.fieldErrors);
      setFormError(result.formError);
    } finally {
      submitting.current = false;
    }
  };

  return (
    <form noValidate onSubmit={submit} aria-label="Add employee form" className="inv-form inv-admin__panel">
      <h2>Add an employee</h2>
      <p className="inv-admin__muted">They receive an invitation link and choose their own password. Their role is assigned by the server.</p>

      {formError && <div className="inv-form__summary" role="alert"><p>{formError}</p></div>}

      {FIELDS.map((f) => (
        <div className="inv-form__field" key={f.name}>
          <label htmlFor={`emp-${f.name}`}>{f.label} <span aria-hidden="true">*</span></label>
          <input
            id={`emp-${f.name}`} name={f.name} type={f.type} className="inv-cf__control"
            value={values[f.name]} onChange={onChange} autoComplete={f.autoComplete} required aria-required="true"
            aria-invalid={errors[f.name] ? "true" : undefined}
            aria-describedby={errors[f.name] ? `emp-${f.name}-err` : undefined}
          />
          {errors[f.name] && <p id={`emp-${f.name}-err`} className="inv-form__error">{errors[f.name]}</p>}
        </div>
      ))}

      <div className="inv-admin__row-actions">
        <button type="submit" className="inv-btn inv-btn--primary" disabled={isLoading} aria-busy={isLoading}>
          {isLoading ? "Creating…" : "Create employee"}
        </button>
        <button type="button" className="inv-btn inv-btn--outline" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}