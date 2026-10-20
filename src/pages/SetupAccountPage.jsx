import { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Container from "../components/common/Container";
import Breadcrumbs from "../components/common/Breadcrumbs";
import usePageSeo from "../hooks/usePageSeo";
import { useDeclineInvitationMutation, useSetupAccountMutation } from "../services/authApi";
import { PASSWORD_HINT, toFormErrors, validateSetup } from "../utils/authValidation";
import { ROUTES } from "../utils/constant";
import "../styles/course-pages.css";

const FIELDS = [
  { name: "password", label: "New password", hint: PASSWORD_HINT },
  { name: "confirmPassword", label: "Confirm password" },
];

export default function SetupAccountPage() {
  usePageSeo({ title: "Accept your invitation | INVYN TECH", description: "Accept your invitation and choose a password.", path: ROUTES.setupAccount }, []);

  const navigate = useNavigate();
  const location = useLocation();
  // The token lives in the URL fragment (#token=...), so it is never sent to a server or written to access logs.
  const token = new URLSearchParams(location.hash.replace(/^#/, "")).get("token") ?? "";

  const [setupAccount, { isLoading }] = useSetupAccountMutation();
  const [declineInvitation, { isLoading: declining }] = useDeclineInvitationMutation();
  const submitting = useRef(false);
  const [values, setValues] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [declined, setDeclined] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting.current) return;
    setFormError(null);

    const found = validateSetup(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    submitting.current = true;
    try {
      await setupAccount({ token, ...values }).unwrap();
      navigate(ROUTES.login, { replace: true, state: { registered: true } });
    } catch (error) {
      const result = toFormErrors(error);
      setErrors(result.fieldErrors);
      setFormError(result.formError);
      setValues({ password: "", confirmPassword: "" });
    } finally {
      submitting.current = false;
    }
  };

  const onDecline = async () => {
    if (submitting.current) return;
    if (!window.confirm("Decline this invitation? Your pending account will be removed and the link will stop working.")) return;

    submitting.current = true;
    try {
      await declineInvitation({ token }).unwrap();
      setDeclined(true);
    } catch (error) {
      setFormError(toFormErrors(error).formError);
    } finally {
      submitting.current = false;
    }
  };

  return (
    <div className="inv-page">
      <Container>
        <Breadcrumbs items={[{ label: "Home", to: ROUTES.home }, { label: "Invitation" }]} />
        <div className="inv-enroll">
          <header>
            <p className="inv-eyebrow">INVITATION</p>
            <h1 className="inv-section-title">{declined ? "Invitation declined" : "Accept your invitation"}</h1>
          </header>

          {declined ? (
            <p role="status">
              You declined the invitation and your pending account was removed. <Link to={ROUTES.home}>Back to the website</Link>
            </p>
          ) : !token ? (
            <p className="inv-form__summary" role="alert">
              This invitation link is incomplete. Ask your administrator to send a new one, or <Link to={ROUTES.login}>log in</Link>.
            </p>
          ) : (
            <form noValidate onSubmit={onSubmit} aria-label="Accept invitation form" className="inv-form">
              <p>You have been invited to join INVYN TECH as an employee. Choose a password to accept, or decline the invitation.</p>
              {formError && <div className="inv-form__summary" role="alert"><p>{formError}</p></div>}

              {FIELDS.map((f) => (
                <div className="inv-form__field" key={f.name}>
                  <label htmlFor={`setup-${f.name}`}>{f.label} <span aria-hidden="true">*</span></label>
                  <input
                    id={`setup-${f.name}`} name={f.name} type="password" className="inv-cf__control"
                    value={values[f.name]} onChange={onChange} autoComplete="new-password" required aria-required="true"
                    aria-invalid={errors[f.name] ? "true" : undefined}
                    aria-describedby={[f.hint ? `setup-${f.name}-hint` : null, errors[f.name] ? `setup-${f.name}-err` : null].filter(Boolean).join(" ") || undefined}
                  />
                  {f.hint && <p id={`setup-${f.name}-hint`} className="inv-form__hint">{f.hint}</p>}
                  {errors[f.name] && <p id={`setup-${f.name}-err`} className="inv-form__error">{errors[f.name]}</p>}
                </div>
              ))}

              <div className="inv-enroll__actions">
                <button type="submit" className="inv-btn inv-btn--primary" disabled={isLoading || declining} aria-busy={isLoading}>
                  {isLoading ? "Saving…" : "Accept and activate account"}
                </button>
                <button type="button" className="inv-btn inv-btn--outline" onClick={onDecline} disabled={isLoading || declining}>
                  {declining ? "Declining…" : "Decline invitation"}
                </button>
              </div>
            </form>
          )}
        </div>
      </Container>
    </div>
  );
}