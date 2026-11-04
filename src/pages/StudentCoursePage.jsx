import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Container from "../components/common/Container";
import usePageSeo from "../hooks/usePageSeo";
import { useCompleteLessonMutation, useGetCourseMaterialsQuery, useGetStudentCourseQuery } from "../services/studentApi";
import { ROUTES, getCourseRoute } from "../utils/constant";
import { formatDate } from "../utils/studentFormat";
import ProgressBar from "../components/student/ProgressBar";
import MaterialList from "../components/student/courses/MaterialList";
import { CardSkeleton, EmptyState, ErrorState } from "../components/student/StudentStates";
import { Toasts, useToasts } from "../components/student/Toasts";
import "../styles/student-dashboard.css";
import "../styles/student-profile.css";
import "../styles/my-courses.css";

function AccessDenied({ error }) {
  const code = error?.data?.code;
  const notEnrolled = code === "ENROLLMENT_REQUIRED";
  return (
    <div className="sd-error" role="alert">
      <p className="sd-empty__title">{notEnrolled ? "Enrol to access this course" : error?.status === 404 ? "Course not found" : "You cannot open this course"}</p>
      <p className="sd-muted">{error?.data?.message || "This course is not available to you."}</p>
      <div className="sp-actions">
        <Link className="sd-btn sd-btn--primary" to={ROUTES.studentCourses}>Back to My Courses</Link>
        {notEnrolled && <Link className="sd-btn" to={ROUTES.courses}>Browse courses</Link>}
      </div>
    </div>
  );
}

export default function StudentCoursePage() {
  const { courseId } = useParams();
  const { hash } = useLocation();
  const { toasts, push } = useToasts();
  const [pending, setPending] = useState(null);

  const course = useGetStudentCourseQuery(courseId);
  const materials = useGetCourseMaterialsQuery(courseId, { skip: !course.data });
  const [completeLesson] = useCompleteLessonMutation();

  usePageSeo({ title: `${course.data?.title || "Course"} | INVYN TECH`, description: "Your course lessons and materials.", path: `${ROUTES.studentCourses}/${courseId}` }, [course.data?.title]);

  // Jump to #materials when arriving from the "Learning materials" button.
  useEffect(() => {
    if (course.data && hash) document.getElementById(hash.slice(1))?.scrollIntoView?.({ block: "start" });
  }, [course.data, hash]);

  const mark = async (moduleIndex, lessonIndex) => {
    const key = `${moduleIndex}:${lessonIndex}`;
    setPending(key);
    try {
      const res = await completeLesson({ courseId: Number(courseId), moduleIndex, lessonIndex }).unwrap();
      push(res?.data?.course?.status === "completed" ? "Course completed. Congratulations!" : "Lesson marked as complete.");
    } catch (e) {
      push(e?.data?.message || "Could not save your progress.", "error");
    } finally {
      setPending(null);
    }
  };

  const c = course.data;

  return (
    <div className="inv-page">
      <Container>
        <div className="sp mc">
          <nav className="sp-back" aria-label="Breadcrumb"><Link to={ROUTES.studentCourses}>← Back to My Courses</Link></nav>

          {course.isLoading ? (
            <div role="status" aria-label="Loading course" className="sd-stack"><CardSkeleton lines={3} /><CardSkeleton lines={5} /></div>
          ) : course.isError ? (
            [401, 403, 404].includes(course.error?.status) ? <AccessDenied error={course.error} /> : <ErrorState message={course.error?.data?.message} onRetry={course.refetch} />
          ) : (
            <div className="sd-stack">
              <header className="sd-card mc-hero">
                <p className="mc-category">{c.category} · {c.mode} · {c.duration}</p>
                <h1>{c.title}</h1>
                {c.instructor && <p className="sd-muted">Instructor: {c.instructor}</p>}
                <p className="sd-muted">
                  {c.startDate ? `Starts ${formatDate(c.startDate)}` : ""}{c.endDate ? ` · Ends ${formatDate(c.endDate)}` : ""}
                  {c.completedAt ? ` · Completed ${formatDate(c.completedAt)}` : ""}
                </p>
                <ProgressBar value={c.progress.percentage} label="Course progress" />
                <p className="sd-muted">
                  {c.progress.totalLessons > 0 ? `${c.progress.completedLessons}/${c.progress.totalLessons} lessons · ${c.progress.completedModules}/${c.progress.totalModules} modules` : "No lessons available yet"}
                </p>
                <Link className="sd-btn sd-btn--sm" to={getCourseRoute(c.slug)}>Course details</Link>
              </header>

              <section id="lessons" className="sd-card sp-section" aria-labelledby="lessons-h">
                <div className="sp-section__head"><h2 id="lessons-h">Lessons</h2></div>
                {!c.started && <p className="sd-muted">This course starts on {formatDate(c.startDate)}. Lessons open on that date.</p>}
                {c.progress.modules.length === 0 ? (
                  <EmptyState title="No lessons yet">Lessons will appear here once they are added to the course.</EmptyState>
                ) : (
                  <div className="sd-lessons">
                    {c.progress.modules.map((m) => (
                      <div key={m.index} className="sd-lessons__module">
                        <p className="sd-lessons__title">{m.title} <span className="sd-muted">({m.completedLessons}/{m.totalLessons})</span></p>
                        <ul>
                          {m.lessons.map((l) => (
                            <li key={l.index} className={l.completed ? "is-done" : ""}>
                              <span>{l.completed ? "✓ " : ""}{l.title}</span>
                              {!l.completed && c.canTrackProgress && (
                                <button type="button" className="sd-btn sd-btn--sm" disabled={pending === `${m.index}:${l.index}`} onClick={() => mark(m.index, l.index)}>
                                  {pending === `${m.index}:${l.index}` ? "Saving…" : "Mark complete"}
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section id="materials" className="sd-card sp-section" aria-labelledby="materials-h">
                <div className="sp-section__head"><h2 id="materials-h">Learning materials</h2></div>
                {materials.isLoading ? <CardSkeleton lines={3} /> : materials.isError ? (
                  <ErrorState message={materials.error?.data?.message || "We could not load the materials."} onRetry={materials.refetch} />
                ) : (
                  <MaterialList data={materials.data} onError={(m) => push(m, "error")} />
                )}
              </section>
            </div>
          )}
        </div>
      </Container>
      <Toasts toasts={toasts} />
    </div>
  );
}