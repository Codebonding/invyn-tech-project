import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "../components/common/Container";
import Breadcrumbs from "../components/common/Breadcrumbs";
import usePageSeo from "../hooks/usePageSeo";
import useAuth from "../hooks/useAuth";
import { useLogoutUserMutation } from "../services/authApi";
import { useCancelMyEnrollmentMutation, useListMyEnrollmentsQuery } from "../services/enrollmentApi";
import { ROUTES } from "../utils/constant";
import "../styles/course-pages.css";
import "../styles/enroll.css";

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "";

/** The student's own enrolments, with a way to cancel an active one. */
function MyEnrollments() {
  const { data = [], isLoading, isError, refetch } = useListMyEnrollmentsQuery();
  const [cancelEnrollment] = useCancelMyEnrollmentMutation();
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const onCancel = async (enrollment) => {
    if (!window.confirm(`Cancel your enrolment in "${enrollment.course?.title ?? "this course"}"?`)) return;
    setError(null);
    setBusyId(enrollment.id);
    try {
      await cancelEnrollment(enrollment.id).unwrap();
    } catch (err) {
      setError(err?.data?.message || "The enrolment could not be cancelled.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="inv-enroll__done" aria-labelledby="my-enrolments">
      <h2 id="my-enrolments">My enrolments</h2>

      {isLoading && <p role="status">Loading your enrolments…</p>}
      {isError && (
        <>
          <p role="alert">Your enrolments could not be loaded.</p>
          <button type="button" className="inv-btn inv-btn--outline inv-btn--sm" onClick={() => refetch()}>Try again</button>
        </>
      )}
      {error && <p className="inv-form__error" role="alert">{error}</p>}
      {!isLoading && !isError && data.length === 0 && (
        <p>You have not enrolled in any course yet. <Link to={ROUTES.courses}>Browse courses</Link></p>
      )}

      {data.length > 0 && (
        <ul className="inv-myenr">
          {data.map((e) => (
            <li key={e.id} className="inv-myenr__item">
              <span className="inv-myenr__main">
                <span className="inv-myenr__title">
                  {e.course?.slug ? <Link to={`${ROUTES.courses}/${e.course.slug}`}>{e.course.title}</Link> : e.course?.title ?? "Course"}
                </span>
                <span className="inv-myenr__meta">Enrolled {formatDate(e.enrolledAt)}</span>
              </span>
              <span className="inv-myenr__side">
                <span className={`inv-status inv-status--${e.status}`}>{e.status}</span>
                {e.status === "active" && (
                  <button type="button" className="inv-btn inv-btn--outline inv-btn--sm" onClick={() => onCancel(e)} disabled={busyId === e.id}>
                    {busyId === e.id ? "Cancelling…" : "Cancel"}
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function AccountPage() {
  usePageSeo({ title: "Your account | INVYN TECH", description: "Your INVYN TECH account.", path: ROUTES.account }, []);

  const navigate = useNavigate();
  const { user } = useAuth();
  const [logoutUser, { isLoading }] = useLogoutUserMutation();

  const onLogout = async () => {
    try {
      await logoutUser().unwrap();
    } catch {
      /* the local session is cleared either way (see authApi.logoutUser) */
    }
    navigate(ROUTES.home, { replace: true });
  };

  if (!user) return null;

  return (
    <div className="inv-page">
      <Container>
        <Breadcrumbs items={[{ label: "Home", to: ROUTES.home }, { label: "Account" }]} />
        <div className="inv-enroll">
          <header>
            <p className="inv-eyebrow">ACCOUNT</p>
            <h1 className="inv-section-title">Hello, {user.name}</h1>
          </header>
          <div className="inv-enroll__done">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <div className="inv-enroll__actions">
              {user.role === "admin" && (
                <>
                  <Link className="inv-btn inv-btn--primary" to={ROUTES.adminDashboard}>Admin dashboard</Link>
                  <Link className="inv-btn inv-btn--outline" to={ROUTES.adminEmployees}>Manage employees</Link>
                </>
              )}
              <Link className="inv-btn inv-btn--outline" to={ROUTES.changePassword}>Change password</Link>
              <button type="button" className="inv-btn inv-btn--primary" onClick={onLogout} disabled={isLoading}>
                {isLoading ? "Logging out…" : "Log out"}
              </button>
            </div>
          </div>

          {user.role === "student" && <MyEnrollments />}
        </div>
      </Container>
    </div>
  );
}