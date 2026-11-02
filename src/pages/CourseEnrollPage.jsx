import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Container from "../components/common/Container";
import Breadcrumbs from "../components/common/Breadcrumbs";
import CourseNotFound from "../components/courses/CourseNotFound";
import usePageSeo from "../hooks/usePageSeo";
import useAuth from "../hooks/useAuth";
import useAllCourses from "../hooks/useAllCourses";
import { useEnrollInCourseMutation, useListMyEnrollmentsQuery } from "../services/enrollmentApi";
import { feeLabel, trimText } from "../utils/courses";
import { ROUTES } from "../utils/constant";
import "../styles/course-pages.css";
import "../styles/enroll.css";

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "";

/** Friendly text for the errors the enrolment API can return. */
function messageFor(error) {
  const status = error?.status;
  const code = error?.data?.code;
  if (code === "ENROLLMENT_EXISTS") return "You are already enrolled in this course.";
  if (code === "PASSWORD_CHANGE_REQUIRED") return "Please change your temporary password first, then enrol.";
  if (status === 401) return "Your session has ended. Please log in again to enrol.";
  if (status === 403) return "Only student accounts can enrol in courses.";
  if (status === 404) return "This course is no longer open for enrolment.";
  if (status === 429) return "Too many attempts. Please wait a moment and try again.";
  return error?.data?.message || "Enrolment could not be completed. Please try again.";
}

function Loading({ children }) {
  return (
    <div className="inv-page">
      <Container>
        <p role="status">{children}</p>
      </Container>
    </div>
  );
}

/** The page frame: breadcrumbs and heading, shared by every state. */
function Shell({ course, children }) {
  return (
    <div className="inv-page">
      <Container>
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Courses", to: ROUTES.courses }, { label: course.title, to: course.href }, { label: "Enrol" }]} />
        <div className="inv-enroll">
          <header>
            <p className="inv-eyebrow">ENROLMENT</p>
            <h1 className="inv-section-title">Enrol in {course.title}</h1>
          </header>
          {children}
        </div>
      </Container>
    </div>
  );
}

export default function CourseEnrollPage() {
  const { slug } = useParams();
  const location = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { getBySlug, isLoading: coursesLoading } = useAllCourses();
  const course = getBySlug(slug);
  const isStudent = user?.role === "student";

  const { data: mine = [], isLoading: mineLoading, isError: mineError, refetch } = useListMyEnrollmentsQuery(undefined, { skip: !isStudent });
  const [enroll, { isLoading: enrolling }] = useEnrollInCourseMutation();
  const [done, setDone] = useState(null); // { courseId, enrollment } right after a successful enrolment
  const [failure, setFailure] = useState(null); // { slug, text }
  const panelRef = useRef(null);

  usePageSeo(
    course
      ? { title: `Enrol in ${course.title} | INVYN TECH`, description: trimText(`Enrol in ${course.title} at INVYN TECH.`), path: `${course.href}/enroll` }
      : { title: "Course not found | INVYN TECH", description: "This course could not be found.", path: `/courses/${slug}/enroll` },
    [slug, course?.title]
  );

  const justEnrolled = done && course && done.courseId === course.courseId ? done.enrollment : null;
  useEffect(() => {
    if (justEnrolled) panelRef.current?.focus();
  }, [justEnrolled]);

  if (!course) return coursesLoading ? <Loading>Loading course…</Loading> : <CourseNotFound />;
  if (authLoading) return <Loading>Checking your session…</Loading>;

  // 1. Not logged in
  if (!isAuthenticated) {
    return (
      <Shell course={course}>
        <div className="inv-enroll__done">
          <h2>Log in to enrol</h2>
          <p>Your enrolment is saved to your student account, so you can follow its status at any time. Log in, or create a student account first.</p>
          <div className="inv-enroll__actions">
            <Link className="inv-btn inv-btn--primary" to={ROUTES.login} state={{ from: location }}>Log in</Link>
            <Link className="inv-btn inv-btn--outline" to={ROUTES.register}>Create an account</Link>
          </div>
        </div>
      </Shell>
    );
  }

  // 2. Logged in as admin or employee
  if (!isStudent) {
    return (
      <Shell course={course}>
        <div className="inv-enroll__done">
          <h2>Enrolment is for student accounts</h2>
          <p>You are signed in with a {user.role} account. To enrol in a course, log in with a student account.</p>
          <div className="inv-enroll__actions">
            <Link className="inv-btn inv-btn--outline" to={course.href}>Back to course</Link>
          </div>
        </div>
      </Shell>
    );
  }

  // 3. Checking existing enrolments
  if (mineLoading) {
    return (
      <Shell course={course}>
        <p role="status">Checking your enrolments…</p>
      </Shell>
    );
  }
  if (mineError) {
    return (
      <Shell course={course}>
        <div className="inv-form__summary" role="alert">
          <p>We could not check your enrolments. Please try again.</p>
        </div>
        <div className="inv-enroll__actions">
          <button type="button" className="inv-btn inv-btn--primary" onClick={() => refetch()}>Try again</button>
        </div>
      </Shell>
    );
  }

  // 4. Already enrolled (or just enrolled)
  const existing = mine.find((e) => e.courseId === course.courseId);
  const enrolled = existing && existing.status !== "cancelled" ? existing : justEnrolled;
  if (enrolled) {
    return (
      <Shell course={course}>
        <div className="inv-enroll__done" ref={panelRef} tabIndex={-1} role="status">
          <h2>{justEnrolled ? "You are enrolled!" : "You are already enrolled"}</h2>
          <p>{justEnrolled ? "Your enrolment has been saved to your account." : "This course is already on your account."}</p>
          <dl className="inv-cd__facts">
            <div><dt>Course</dt><dd>{course.title}</dd></div>
            <div><dt>Status</dt><dd><span className={`inv-status inv-status--${enrolled.status}`}>{enrolled.status}</span></dd></div>
            <div><dt>Enrolled on</dt><dd>{formatDate(enrolled.enrolledAt)}</dd></div>
          </dl>
          <p>No payment is taken here. Fee and batch details are shared by INVYN TECH directly, and you can contact us any time.</p>
          <div className="inv-enroll__actions">
            <Link className="inv-btn inv-btn--primary" to={ROUTES.account}>View my enrolments</Link>
            <Link className="inv-btn inv-btn--outline" to={course.href}>Back to course</Link>
          </div>
        </div>
      </Shell>
    );
  }

  // 5. Confirm
  const wasCancelled = existing?.status === "cancelled";
  const errorText = failure?.slug === slug ? failure.text : null;

  const onConfirm = async () => {
    setFailure(null);
    if (course.courseId == null) {
      setFailure({ slug, text: "Enrolment is not available for this course right now. Please contact INVYN TECH." });
      return;
    }
    try {
      const enrollment = await enroll(course.courseId).unwrap();
      setDone({ courseId: course.courseId, enrollment });
    } catch (error) {
      setFailure({ slug, text: messageFor(error) });
      if (error?.data?.code === "ENROLLMENT_EXISTS") refetch();
    }
  };

  return (
    <Shell course={course}>
      <p className="inv-demo" role="note">
        {wasCancelled ? "You cancelled this enrolment earlier. You can enrol again below. " : ""}
        Your enrolment is saved to your student account. No payment is taken here.
      </p>

      {errorText && (
        <div className="inv-form__summary" role="alert">
          <p>{errorText}</p>
        </div>
      )}

      <form
        noValidate
        aria-label={`Enrolment form for ${course.title}`}
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm();
        }}
      >
        <div className="inv-enroll__done">
          <h2>Course</h2>
          <dl className="inv-cd__facts">
            <div><dt>Course</dt><dd>{course.title}</dd></div>
            <div><dt>Duration</dt><dd>{course.duration}</dd></div>
            <div><dt>Learning mode</dt><dd>{course.mode}</dd></div>
            <div><dt>Level</dt><dd>{course.level}</dd></div>
            <div><dt>Fee</dt><dd>{feeLabel(course)}</dd></div>
          </dl>
        </div>

        <div className="inv-enroll__done">
          <h2>Your account</h2>
          <dl className="inv-cd__facts">
            <div><dt>Name</dt><dd>{user.name}</dd></div>
            <div><dt>Email</dt><dd>{user.email}</dd></div>
          </dl>
          <p>We use the details from your account, so there is nothing else to fill in.</p>
        </div>

        <div className="inv-enroll__actions">
          <button type="submit" className="inv-btn inv-btn--primary" disabled={enrolling} aria-busy={enrolling}>
            {enrolling ? "Enrolling…" : wasCancelled ? "Enrol again" : "Confirm enrolment"}
          </button>
          <Link className="inv-btn inv-btn--outline" to={course.href}>Cancel</Link>
        </div>
      </form>
    </Shell>
  );
}