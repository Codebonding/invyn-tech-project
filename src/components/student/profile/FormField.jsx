/** A labelled control with an error message tied to it for screen readers (aria-invalid / aria-describedby). */
export default function FormField({ id, label, error, hint, required, as = "input", options = [], ...rest }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const common = {
    id,
    name: id,
    className: `sp-input${error ? " is-invalid" : ""}`,
    "aria-invalid": error ? "true" : undefined,
    "aria-describedby": describedBy,
    "aria-required": required ? "true" : undefined,
    ...rest,
  };

  return (
    <div className="sp-field">
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {as === "select" ? (
        <select {...common}>
          {options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
        </select>
      ) : as === "textarea" ? (
        <textarea rows={2} {...common} />
      ) : (
        <input {...common} />
      )}
      {error ? (
        <p id={`${id}-error`} className="sp-error" role="alert">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="sd-muted">{hint}</p>
      ) : null}
    </div>
  );
}