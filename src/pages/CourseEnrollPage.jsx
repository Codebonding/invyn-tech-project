import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Container from "../components/common/Container";
import Breadcrumbs from "../components/common/Breadcrumbs";
import CourseNotFound from "../components/courses/CourseNotFound";
import usePageSeo from "../hooks/usePageSeo";
import { ROUTES } from "../utils/constant";
import { getCourseBySlug, trimText } from "../utils/courses";
import { validateEnrollment } from "../utils/enrollValidation";
import "../styles/course-pages.css";

const FIELDS = [
  { name: "name", label: "Full name", type: "text", autoComplete: "name", hint: "As you would like it to appear." },
  { name: "email", label: "Email address", type: "email", autoComplete: "email", hint: "We would use this to reply to you." },
  { name: "phone", label: "Phone number", type: "tel", autoComplete: "tel", hint: "Include the country code if outside India, for example +44 20 7946 0958." },
];

export default function CourseEnrollPage() {
  const { slug } = useParams();
  const course = getCourseBySlug(slug);
  const [values, setValues] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(null);
  const doneRef = useRef(null);

  usePageSeo(
    course
      ? { title: `Enrol in ${course.title} | INVYN TECH`, description: trimText(`Enrolment preview for ${course.title} at INVYN TECH.`), path: `${course.href}/enroll` }
      : { title: "Course not found | INVYN TECH", description: "This course could not be found.", path: `/courses/${slug}/enroll` },
    [slug]
  );

  useEffect(() => { setValues({ name: "", email: "", phone: "" }); setErrors({}); setDone(null); }, [slug]);
  useEffect(() => { if (done && doneRef.current) doneRef.current.focus(); }, [done]);

  if (!course) return <CourseNotFound />;

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const found = validateEnrollment(values);
    setErrors(found);
    const first = FIELDS.find((f) => found[f.name]);
    if (first) {
      requestAnimationFrame(() => document.getElementById(`enroll-${first.name}`)?.focus());
      return;
    }
    setDone({ name: values.name.trim() }); // demo only: nothing is stored or sent
  };

  const errorList = FIELDS.filter((f) => errors[f.name]);

  return (
    <div className="inv-page">
      <Container>
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Courses", to: ROUTES.courses }, { label: course.title, to: course.href }, { label: "Enrol" }]} />
        <div className="inv-enroll">
          <header>
            <p className="inv-eyebrow">ENROLMENT PREVIEW</p>
            <h1 className="inv-section-title">Enrol in {course.title}</h1>
          </header>

          <p className="inv-demo" role="note">
            <strong>Demo only.</strong> This form is a preview. Your details are not sent anywhere or saved, and no payment is taken.
          </p>

          {done ? (
            <div className="inv-enroll__done" ref={doneRef} tabIndex={-1} role="status">
              <h2>Thank you, {done.name}</h2>
              <p>This was a demo, so no enrolment has been submitted and nothing was sent to INVYN TECH. To confirm a place in <strong>{course.title}</strong>, please contact us directly.</p>
              <div className="inv-enroll__actions">
                <Link className="inv-btn inv-btn--primary" to={ROUTES.contact}>Contact INVYN TECH</Link>
                <Link className="inv-btn inv-btn--outline" to={course.href}>Back to course</Link>
              </div>
            </div>
          ) : (
            <form noValidate onSubmit={onSubmit} aria-label={`Enrolment preview form for ${course.title}`} className="inv-form">
              {errorList.length > 0 && (
                <div className="inv-form__summary" role="alert">
                  <p>Please fix {errorList.length === 1 ? "this problem" : `these ${errorList.length} problems`}:</p>
                  <ul>{errorList.map((f) => <li key={f.name}><a href={`#enroll-${f.name}`}>{errors[f.name]}</a></li>)}</ul>
                </div>
              )}

              <div className="inv-form__field">
                <label htmlFor="enroll-course">Selected course</label>
                <input id="enroll-course" className="inv-cf__control" value={course.title} readOnly />
              </div>

              {FIELDS.map((f) => (
                <div className="inv-form__field" key={f.name}>
                  <label htmlFor={`enroll-${f.name}`}>{f.label} <span aria-hidden="true">*</span></label>
                  <input
                    id={`enroll-${f.name}`} name={f.name} type={f.type} className="inv-cf__control"
                    value={values[f.name]} onChange={onChange} autoComplete={f.autoComplete} required aria-required="true"
                    aria-invalid={errors[f.name] ? "true" : undefined}
                    aria-describedby={`enroll-${f.name}-hint${errors[f.name] ? ` enroll-${f.name}-err` : ""}`}
                  />
                  <p id={`enroll-${f.name}-hint`} className="inv-form__hint">{f.hint}</p>
                  {errors[f.name] && <p id={`enroll-${f.name}-err`} className="inv-form__error">{errors[f.name]}</p>}
                </div>
              ))}

              <div className="inv-enroll__actions">
                <button type="submit" className="inv-btn inv-btn--primary">Submit preview</button>
                <Link className="inv-btn inv-btn--outline" to={course.href}>Cancel</Link>
              </div>
            </form>
          )}
        </div>
      </Container>
    </div>
  );
}