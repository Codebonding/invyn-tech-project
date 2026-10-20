import { useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Container from "../components/common/Container";
import Breadcrumbs from "../components/common/Breadcrumbs";
import usePageSeo from "../hooks/usePageSeo";
import useAuth from "../hooks/useAuth";
import { useRegisterUserMutation } from "../services/authApi";
import { PASSWORD_HINT, toFormErrors, validateRegistration } from "../utils/authValidation";
import { ROUTES } from "../utils/constant";
import "../styles/course-pages.css";

const FIELDS = [
  { name: "name", label: "Full name", type: "text", autoComplete: "name" },
  { name: "email", label: "Email address", type: "email", autoComplete: "email" },
  { name: "password", label: "Password", type: "password", autoComplete: "new-password", hint: PASSWORD_HINT },
  { name: "confirmPassword", label: "Confirm password", type: "password", autoComplete: "new-password" },
];

const EMPTY = { name: "", email: "", password: "", confirmPassword: "" };

export default function RegisterPage() {
  usePageSeo({ title: "Create an account | INVYN TECH", description: "Create your INVYN TECH account.", path: ROUTES.register }, []);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const submitting = useRef(false);

  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);

  if (isAuthenticated && !isLoading) return <Navigate to={ROUTES.home} replace />;

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting.current) return;
    setFormError(null);

    const found = validateRegistration(values);
    setErrors(found);
    const first = FIELDS.find((f) => found[f.name]);
    if (first) {
      requestAnimationFrame(() => document.getElementById(`register-${first.name}`)?.focus());
      return;
    }

    submitting.current = true;
    try {
      const user = await registerUser({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        confirmPassword: values.confirmPassword,
      }).unwrap();
      // No automatic login: send the person to the login page with a confirmation.
      navigate(ROUTES.login, { replace: true, state: { registered: true, email: user.email } });
    } catch (error) {
      const result = toFormErrors(error);
      setErrors(result.fieldErrors);
      setFormError(result.formError);
      setValues((v) => ({ ...v, password: "", confirmPassword: "" }));
    } finally {
      submitting.current = false;
    }
  };

  const errorList = FIELDS.filter((f) => errors[f.name]);

  return (
    <div className="inv-page">
      <Container>
        <Breadcrumbs items={[{ label: "Home", to: ROUTES.home }, { label: "Create an account" }]} />
        <div className="inv-enroll">
          <header>
            <p className="inv-eyebrow">ACCOUNT</p>
            <h1 className="inv-section-title">Create an account</h1>
          </header>

          <form noValidate onSubmit={onSubmit} aria-label="Create account form" className="inv-form">
            {(formError || errorList.length > 0) && (
              <div className="inv-form__summary" role="alert">
                {formError ? (
                  <p>{formError}</p>
                ) : (
                  <>
                    <p>Please fix {errorList.length === 1 ? "this problem" : `these ${errorList.length} problems`}:</p>
                    <ul>{errorList.map((f) => <li key={f.name}><a href={`#register-${f.name}`}>{errors[f.name]}</a></li>)}</ul>
                  </>
                )}
              </div>
            )}

            {FIELDS.map((f) => (
              <div className="inv-form__field" key={f.name}>
                <label htmlFor={`register-${f.name}`}>{f.label} <span aria-hidden="true">*</span></label>
                <input
                  id={`register-${f.name}`} name={f.name} type={f.type} className="inv-cf__control"
                  value={values[f.name]} onChange={onChange} autoComplete={f.autoComplete} required aria-required="true"
                  aria-invalid={errors[f.name] ? "true" : undefined}
                  aria-describedby={[f.hint ? `register-${f.name}-hint` : null, errors[f.name] ? `register-${f.name}-err` : null].filter(Boolean).join(" ") || undefined}
                />
                {f.hint && <p id={`register-${f.name}-hint`} className="inv-form__hint">{f.hint}</p>}
                {errors[f.name] && <p id={`register-${f.name}-err`} className="inv-form__error">{errors[f.name]}</p>}
              </div>
            ))}

            <div className="inv-enroll__actions">
              <button type="submit" className="inv-btn inv-btn--primary" disabled={isLoading} aria-busy={isLoading}>
                {isLoading ? "Creating account…" : "Create account"}
              </button>
              <Link className="inv-btn inv-btn--outline" to={ROUTES.login}>I already have an account</Link>
            </div>
          </form>
        </div>
      </Container>
    </div>
  );
}
