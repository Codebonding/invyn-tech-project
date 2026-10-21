import { useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { courses } from "../../data/courses";
import { useCreateEnquiryMutation } from "../../services/enquiryApi";
import { validateEnrollment } from "../../utils/enrollValidation";
import { toFormErrors } from "../../utils/authValidation";
import { ROUTES } from "../../utils/constant";

const FIELDS = [
  { name: "name", label: "Full name", type: "text", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "phone", label: "Phone number", type: "tel", autoComplete: "tel" },
];
const INTERESTS = [...courses.map((c) => c.title), "Internship Program", "Not sure yet"];

export default function EnquiryForm({ prefill, onDone, onCancel }) {
  const { pathname } = useLocation();
  const [createEnquiry, { isLoading }] = useCreateEnquiryMutation();
  const busy = useRef(false);
  const [v, setV] = useState({ name: "", email: "", phone: "", interestedCourse: INTERESTS.includes(prefill) ? prefill : "", message: "", consent: false, website: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setV((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy.current) return;
    setFormError(null);

    const found = validateEnrollment(v);
    if (!v.interestedCourse) found.interestedCourse = "Please choose a course.";
    if (!v.consent) found.consent = "Please tick the box to agree to be contacted.";
    setErrors(found);
    if (Object.keys(found).length) return;

    busy.current = true;
    try {
      const result = await createEnquiry({
        name: v.name.trim(), email: v.email.trim(), phone: v.phone.trim(), interestedCourse: v.interestedCourse,
        message: v.message.trim(), consent: true, website: v.website, sourcePage: pathname,
      }).unwrap();
      onDone({ name: v.name.trim().split(/\s+/)[0], reference: result.reference });
    } catch (error) {
      const r = toFormErrors(error);
      setErrors(r.fieldErrors);
      setFormError(r.formError);
    } finally {
      busy.current = false;
    }
  };

  const err = (n) => errors[n] && <p id={`cb-${n}-err`} className="cb-error">{errors[n]}</p>;
  const a11y = (n) => ({ "aria-invalid": errors[n] ? "true" : undefined, "aria-describedby": errors[n] ? `cb-${n}-err` : undefined });

  return (
    <form className="cb-form" noValidate onSubmit={submit} aria-label="Enquiry form">
      {formError && <p className="cb-error" role="alert">{formError}</p>}

      {FIELDS.map((f) => (
        <div className="cb-field" key={f.name}>
          <label htmlFor={`cb-${f.name}`}>{f.label}</label>
          <input id={`cb-${f.name}`} name={f.name} type={f.type} autoComplete={f.autoComplete} value={v[f.name]} onChange={change} required {...a11y(f.name)} />
          {err(f.name)}
        </div>
      ))}

      <div className="cb-field">
        <label htmlFor="cb-interestedCourse">Interested in</label>
        <select id="cb-interestedCourse" name="interestedCourse" value={v.interestedCourse} onChange={change} required {...a11y("interestedCourse")}>
          <option value="">Choose…</option>
          {INTERESTS.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
        {err("interestedCourse")}
      </div>

      <div className="cb-field">
        <label htmlFor="cb-message">Message (optional)</label>
        <textarea id="cb-message" name="message" rows={2} maxLength={1000} value={v.message} onChange={change} />
        {err("message")}
      </div>

      {/* Honeypot: hidden from people and screen readers; bots fill it in. */}
      <div className="cb-hp" aria-hidden="true">
        <label htmlFor="cb-website">Website</label>
        <input id="cb-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={v.website} onChange={change} />
      </div>

      <div className="cb-consent">
        <input id="cb-consent" name="consent" type="checkbox" checked={v.consent} onChange={change} {...a11y("consent")} />
        <label htmlFor="cb-consent">
          I agree that INVYN TECH may contact me about this enquiry using the details above. See the <Link to={ROUTES.privacy}>Privacy Policy</Link>.
        </label>
      </div>
      {err("consent")}

      <div className="cb-actions">
        <button type="submit" className="cb-btn cb-btn--primary" disabled={isLoading} aria-busy={isLoading}>{isLoading ? "Sending…" : "Send enquiry"}</button>
        <button type="button" className="cb-btn" onClick={onCancel} disabled={isLoading}>Cancel</button>
      </div>
    </form>
  );
}