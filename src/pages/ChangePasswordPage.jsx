import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../components/common/Container";
import Breadcrumbs from "../components/common/Breadcrumbs";
import usePageSeo from "../hooks/usePageSeo";
import useAuth from "../hooks/useAuth";
import { useChangePasswordMutation } from "../services/authApi";
import { PASSWORD_HINT, toFormErrors, validateChangePassword } from "../utils/authValidation";
import { ROUTES } from "../utils/constant";
import "../styles/course-pages.css";

const FIELDS = [
  { name: "currentPassword", label: "Current password", autoComplete: "current-password" },
  { name: "newPassword", label: "New password", autoComplete: "new-password", hint: PASSWORD_HINT },
  { name: "confirmNewPassword", label: "Confirm new password", autoComplete: "new-password" },
];
const EMPTY = { currentPassword: "", newPassword: "", confirmNewPassword: "" };

export default function ChangePasswordPage() {
  usePageSeo({ title: "Change password | INVYN TECH", description: "Change your INVYN TECH password.", path: ROUTES.changePassword }, []);

  const navigate = useNavigate();
  const { user } = useAuth();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const submitting = useRef(false);

  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);

  const forced = Boolean(user?.mustChangePassword);

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting.current) return;
    setFormError(null);

    const found = validateChangePassword(values);
    setErrors(found);
    const first = FIELDS.find((f) => found[f.name]);
    if (first) {
      requestAnimationFrame(() => document.getElementById(`cp-${first.name}`)?.focus());
      return;
    }

    submitting.current = true;
    try {
      await changePassword(values).unwrap();
      navigate(ROUTES.account, { replace: true });
    } catch (error) {
      const result = toFormErrors(error);
      setErrors(result.fieldErrors);
      setFormError(result.formError);
      setValues(EMPTY);
    } finally {
      submitting.current = false;
    }
  };

  const errorList = FIELDS.filter((f) => errors[f.name]);

  return (
    <div className="inv-page">
      <Container>
        <Breadcrumbs items={[{ label: "Home", to: ROUTES.home }, { label: "Change password" }]} />
        <div className="inv-enroll">
          <header>
            <p className="inv-eyebrow">ACCOUNT</p>
            <h1 className="inv-section-title">Change password</h1>
          </header>

          {forced && (
            <p className="inv-demo" role="status">
              <strong>Action required.</strong> Your account was set up with a temporary password. Choose a new one to continue.
            </p>
          )}

          <form noValidate onSubmit={onSubmit} aria-label="Change password form" className="inv-form">
            {(formError || errorList.length > 0) && (
              <div className="inv-form__summary" role="alert">
                {formError ? (
                  <p>{formError}</p>
                ) : (
                  <ul>{errorList.map((f) => <li key={f.name}><a href={`#cp-${f.name}`}>{errors[f.name]}</a></li>)}</ul>
                )}
              </div>
            )}

            {FIELDS.map((f) => (
              <div className="inv-form__field" key={f.name}>
                <label htmlFor={`cp-${f.name}`}>{f.label} <span aria-hidden="true">*</span></label>
                <input
                  id={`cp-${f.name}`} name={f.name} type="password" className="inv-cf__control"
                  value={values[f.name]} onChange={onChange} autoComplete={f.autoComplete} required aria-required="true"
                  aria-invalid={errors[f.name] ? "true" : undefined}
                  aria-describedby={[f.hint ? `cp-${f.name}-hint` : null, errors[f.name] ? `cp-${f.name}-err` : null].filter(Boolean).join(" ") || undefined}
                />
                {f.hint && <p id={`cp-${f.name}-hint`} className="inv-form__hint">{f.hint}</p>}
                {errors[f.name] && <p id={`cp-${f.name}-err`} className="inv-form__error">{errors[f.name]}</p>}
              </div>
            ))}

            <div className="inv-enroll__actions">
              <button type="submit" className="inv-btn inv-btn--primary" disabled={isLoading} aria-busy={isLoading}>
                {isLoading ? "Saving…" : "Change password"}
              </button>
            </div>
          </form>
        </div>
      </Container>
    </div>
  );
}