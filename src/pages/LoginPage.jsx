import { useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Container from "../components/common/Container";
import Breadcrumbs from "../components/common/Breadcrumbs";
import usePageSeo from "../hooks/usePageSeo";
import useAuth from "../hooks/useAuth";
import { useLoginUserMutation } from "../services/authApi";
import { toFormErrors, validateLogin } from "../utils/authValidation";
import { ROUTES } from "../utils/constant";
import "../styles/course-pages.css";

const FIELDS = [
  { name: "email", label: "Email address", type: "email", autoComplete: "email" },
  { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
];

export default function LoginPage() {
  usePageSeo({ title: "Log in | INVYN TECH", description: "Log in to your INVYN TECH account.", path: ROUTES.login }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const submitting = useRef(false);

  const [values, setValues] = useState({ email: location.state?.email ?? "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);

  const from = location.state?.from?.pathname || ROUTES.home;
  const justRegistered = Boolean(location.state?.registered);

  if (isAuthenticated && !isLoading) return <Navigate to={from} replace />;

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting.current) return; // blocks double submits before React re-renders
    setFormError(null);

    const found = validateLogin(values);
    setErrors(found);
    const first = FIELDS.find((f) => found[f.name]);
    if (first) {
      requestAnimationFrame(() => document.getElementById(`login-${first.name}`)?.focus());
      return;
    }

    submitting.current = true;
    try {
      await loginUser({ email: values.email.trim(), password: values.password }).unwrap();
      navigate(from, { replace: true });
    } catch (error) {
      const result = toFormErrors(error);
      setErrors(result.fieldErrors);
      setFormError(result.formError);
      setValues((v) => ({ ...v, password: "" }));
    } finally {
      submitting.current = false;
    }
  };

  const errorList = FIELDS.filter((f) => errors[f.name]);

  return (
    <div className="inv-page">
      <Container>
        <Breadcrumbs items={[{ label: "Home", to: ROUTES.home }, { label: "Log in" }]} />
        <div className="inv-enroll">
          <header>
            <p className="inv-eyebrow">ACCOUNT</p>
            <h1 className="inv-section-title">Log in</h1>
          </header>

          {justRegistered && (
            <p className="inv-demo" role="status">
              <strong>Account created.</strong> Log in with your new email and password.
            </p>
          )}

          <form noValidate onSubmit={onSubmit} aria-label="Log in form" className="inv-form">
            {(formError || errorList.length > 0) && (
              <div className="inv-form__summary" role="alert">
                {formError ? (
                  <p>{formError}</p>
                ) : (
                  <>
                    <p>Please fix {errorList.length === 1 ? "this problem" : `these ${errorList.length} problems`}:</p>
                    <ul>{errorList.map((f) => <li key={f.name}><a href={`#login-${f.name}`}>{errors[f.name]}</a></li>)}</ul>
                  </>
                )}
              </div>
            )}

            {FIELDS.map((f) => (
              <div className="inv-form__field" key={f.name}>
                <label htmlFor={`login-${f.name}`}>{f.label} <span aria-hidden="true">*</span></label>
                <input
                  id={`login-${f.name}`} name={f.name} type={f.type} className="inv-cf__control"
                  value={values[f.name]} onChange={onChange} autoComplete={f.autoComplete} required aria-required="true"
                  aria-invalid={errors[f.name] ? "true" : undefined}
                  aria-describedby={errors[f.name] ? `login-${f.name}-err` : undefined}
                />
                {errors[f.name] && <p id={`login-${f.name}-err`} className="inv-form__error">{errors[f.name]}</p>}
              </div>
            ))}

            <div className="inv-enroll__actions">
              <button type="submit" className="inv-btn inv-btn--primary" disabled={isLoading} aria-busy={isLoading}>
                {isLoading ? "Logging in…" : "Log in"}
              </button>
              <Link className="inv-btn inv-btn--outline" to={ROUTES.register}>Create an account</Link>
            </div>
          </form>
        </div>
      </Container>
    </div>
  );
}
