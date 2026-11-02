import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import Container from "../components/common/Container";
import Breadcrumbs from "../components/common/Breadcrumbs";
import Icon from "../components/common/Icon";
import { Section, List } from "../components/common/DetailBlocks";
import CourseCard from "../components/courses/CourseCard";
import CourseNotFound from "../components/courses/CourseNotFound";
import usePageSeo from "../hooks/usePageSeo";
import useAllCourses from "../hooks/useAllCourses";
import { useGetPublicCourseQuery } from "../services/publicCoursesApi";
import { toCardCourse } from "../utils/liveCourses";
import { ROUTES } from "../utils/constant";
import { enrollHref, feeLabel, getRelated, hasKnownFee, trimText } from "../utils/courses";
import "../styles/course-pages.css";

const CERTIFICATE_FALLBACK = "Certificate details are confirmed by INVYN TECH. Please contact us to learn what is offered for this course.";

function Details({ course }) {
  const { courses } = useAllCourses();
  const faqs = [
    ...course.faqs,
    { q: "How much does this course cost?", a: hasKnownFee(course) ? `The listed fee is ${feeLabel(course)}.` : "Fee details are shared by INVYN TECH on request. Please contact us for the current fee." },
    { q: "Can I learn online or on campus?", a: `Learning mode for this course: ${course.mode}.` },
    { q: "How do I enrol?", a: "Select Enrol Now to start. The enrolment form is currently a preview, so to confirm a place please contact INVYN TECH through the Contact page." },
  ];
  const related = getRelated(course, 3, courses);

  return (
    <>
      <header className="inv-cd__hero">
        <p className="inv-eyebrow">{course.category}</p>
        <h1 className="inv-section-title">{course.title}</h1>
        <p className="inv-section-desc">{course.description}</p>
        <ul className="inv-cd__chips" aria-label="Course summary">
          <li><Icon name="clock" size={16} /> {course.duration}</li>
          <li><Icon name="monitor" size={16} /> {course.mode}</li>
          <li><Icon name="bars" size={16} /> {course.level}</li>
        </ul>
        <div className="inv-cd__cta">
          <Link className="inv-btn inv-btn--primary" to={enrollHref(course.slug)}>Enrol Now <Icon name="arrow" size={18} className="inv-btn__arrow" /></Link>
          <Link className="inv-btn inv-btn--outline" to={ROUTES.contact}>Talk to INVYN TECH</Link>
        </div>
      </header>

      <div className="row g-4 g-xl-5">
        <div className="col-12 col-lg-8">
          {course.outcomes.length > 0 && <Section id="cd-outcomes" title="What you will learn"><List items={course.outcomes} /></Section>}

          <Section id="cd-curriculum" title="Course curriculum">
            {course.curriculum.length > 0 ? (
              <div className="inv-acc">
                {course.curriculum.map((m, i) => (
                  <details key={`${i}-${m.title}`} open={i === 0}>
                    <summary><span><b>Module {i + 1}</b> {m.title}</span><small>{m.topics.length} topics</small></summary>
                    <List items={m.topics} />
                  </details>
                ))}
              </div>
            ) : <p className="inv-cd__muted">The detailed curriculum for this course will be shared soon. Contact INVYN TECH for the current outline.</p>}
          </Section>

          {course.technologies.length > 0 && (
            <Section id="cd-tech" title="Technologies covered">
              <ul className="inv-pills" aria-label="Technologies">{course.technologies.map((t) => <li className="inv-pill" key={t}>{t}</li>)}</ul>
            </Section>
          )}

          {course.projects.length > 0 && <Section id="cd-projects" title="Practical projects"><List items={course.projects} /></Section>}

          <Section id="cd-eligibility" title="Eligibility and prerequisites">
            <p>{course.eligibility || "Contact INVYN TECH to check whether this course suits your background."}</p>
            {course.prerequisites.length > 0 && <List items={course.prerequisites} />}
          </Section>

          <Section id="cd-cert" title="Certificate"><p>{course.certificate || CERTIFICATE_FALLBACK}</p></Section>

          <Section id="cd-faq" title="Frequently asked questions">
            <div className="inv-acc">
              {faqs.map((f, i) => (
                <details key={`${i}-${f.q}`}><summary><span>{f.q}</span></summary><p>{f.a}</p></details>
              ))}
            </div>
          </Section>
        </div>

        <aside className="col-12 col-lg-4" aria-label="Course summary and enrolment">
          <div className="inv-cd__aside">
            <h2 className="inv-cd__h2">Course details</h2>
            <dl className="inv-cd__facts">
              <div><dt>Duration</dt><dd>{course.duration}</dd></div>
              <div><dt>Learning mode</dt><dd>{course.mode}</dd></div>
              <div><dt>Level</dt><dd>{course.level}</dd></div>
              <div><dt>Category</dt><dd>{course.category}</dd></div>
              <div><dt>Fee</dt><dd>{feeLabel(course)}</dd></div>
            </dl>
            <Link className="inv-btn inv-btn--primary inv-cd__block" to={enrollHref(course.slug)}>Enrol Now</Link>
            <Link className="inv-cd__link" to={ROUTES.contact}>Have a question? Contact us</Link>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="inv-cd__related" aria-labelledby="cd-related">
          <h2 id="cd-related" className="inv-cd__h2">Related courses</h2>
          <ul className="row g-4 inv-cgrid" aria-label="Related courses">
            {related.map((c) => (
              <li key={c.slug} className="col-12 col-md-6 col-xl-4"><CourseCard course={c} tiltIntensity={0} /></li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

export default function CourseDetailPage() {
  const { slug } = useParams();
  const { data, isLoading } = useGetPublicCourseQuery(slug, { refetchOnMountOrArgChange: true });
  const course = useMemo(() => (data ? toCardCourse(data) : null), [data]);
  usePageSeo(
    course
      ? { title: `${course.title} Course | INVYN TECH`, description: trimText(course.description), path: course.href }
      : { title: "Course not found | INVYN TECH", description: "This course could not be found.", path: `/courses/${slug}` },
    [slug, course?.title]
  );
  if (!course && isLoading) return <div className="inv-page"><Container><p role="status">Loading course…</p></Container></div>;
  if (!course) return <CourseNotFound />;
  return (
    <div className="inv-page">
      <Container>
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Courses", to: ROUTES.courses }, { label: course.title }]} />
        <Details course={course} />
      </Container>
    </div>
  );
}