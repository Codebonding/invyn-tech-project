import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../utils/constant";
import { MESSAGE_MAX, validateEnquiry } from "../../utils/services-page";

const FIELDS = [
  { name: "name", label: "Full name", type: "text", autoComplete: "name", hint: "As you would like it to appear.", required: true },
  { name: "email", label: "Email address", type: "email", autoComplete: "email", hint: "We would use this to reply to you.", required: true },
  { name: "phone", label: "Phone number", type: "tel", autoComplete: "tel", hint: "Include the country code if outside India, for example +44 20 7946 0958.", required: true },
  { name: "message", label: "Project details", type: "textarea", hint: `Optional. Tell us briefly what you need (up to ${MESSAGE_MAX} characters).`, required: false },
];
const EMPTY = { name: "", email: "", phone: "", message: "" };

/** Enquiry form placeholder: validates, but nothing is stored or sent. Render with key={slug} so it resets per service. */
export default function ServiceEnquiryForm({ service }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(null);
  const doneRef = useRef(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const found = validateEnquiry(values);
    setErrors(found);
    const first = FIELDS.find((f) => found[f.name]);
    if (first) {
      requestAnimationFrame(() => document.getElementById(`enquiry-${first.name}`)?.focus());
      return;
    }
    setDone({ name: values.name.trim() });
    requestAnimationFrame(() => doneRef.current?.focus());
  };

  const errorList = FIELDS.filter((f) => errors[f.name]);

  if (done) {
    return (
      <div className="inv-enroll__done" ref={doneRef} tabIndex={-1} role="status">
        <h2>Thank you, {done.name}</h2>
        <p>This was a preview, so no enquiry has been submitted and nothing was sent to INVYN TECH. To discuss <strong>{service.title}</strong>, please contact us directly.</p>
        <div className="inv-enroll__actions">
          <Link className="inv-btn inv-btn--primary" to={ROUTES.contact}>Contact INVYN TECH</Link>
          <Link className="inv-btn inv-btn--outline" to={service.href}>Back to service</Link>
        </div>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} aria-label={`Enquiry preview form for ${service.title}`} className="inv-form">
      {errorList.length > 0 && (
        <div className="inv-form__summary" role="alert">
          <p>Please fix {errorList.length === 1 ? "this problem" : `these ${errorList.length} problems`}:</p>
          <ul>{errorList.map((f) => <li key={f.name}><a href={`#enquiry-${f.name}`}>{errors[f.name]}</a></li>)}</ul>
        </div>
      )}

      <div className="inv-form__field">
        <label htmlFor="enquiry-service">Service</label>
        <input id="enquiry-service" className="inv-cf__control" value={service.title} readOnly />
      </div>

      {FIELDS.map((f) => {
        const Tag = f.type === "textarea" ? "textarea" : "input";
        return (
          <div className="inv-form__field" key={f.name}>
            <label htmlFor={`enquiry-${f.name}`}>{f.label} {f.required && <span aria-hidden="true">*</span>}</label>
            <Tag
              id={`enquiry-${f.name}`} name={f.name} className="inv-cf__control"
              value={values[f.name]} onChange={onChange} autoComplete={f.autoComplete}
              {...(Tag === "input" ? { type: f.type } : { rows: 5 })}
              required={f.required} aria-required={f.required ? "true" : undefined}
              aria-invalid={errors[f.name] ? "true" : undefined}
              aria-describedby={`enquiry-${f.name}-hint${errors[f.name] ? ` enquiry-${f.name}-err` : ""}`}
            />
            <p id={`enquiry-${f.name}-hint`} className="inv-form__hint">{f.hint}</p>
            {errors[f.name] && <p id={`enquiry-${f.name}-err`} className="inv-form__error">{errors[f.name]}</p>}
          </div>
        );
      })}

      <div className="inv-enroll__actions">
        <button type="submit" className="inv-btn inv-btn--primary">Submit preview</button>
        <Link className="inv-btn inv-btn--outline" to={service.href}>Cancel</Link>
      </div>
    </form>
  );
}