import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/common/Container";
import usePageSeo from "../hooks/usePageSeo";
import {
  useCreateCourseMutation,
  useListCoursesQuery,
  useListEnrollmentsQuery,
  useListStudentsQuery,
  useUpdateCourseMutation,
} from "../services/dashboardApi";
import { toFormErrors } from "../utils/authValidation";
import { ROUTES } from "../utils/constant";
import "../styles/course-pages.css";
import "../styles/admin.css";
import "../styles/dashboard.css";

const initials = (name) => name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();

function CourseQuickAdd() {
  const [createCourse, { isLoading }] = useCreateCourseMutation();
  const busy = useRef(false);
  const [v, setV] = useState({ title: "", description: "", status: "draft" });
  const [err, setErr] = useState({});
  const [formError, setFormError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (busy.current) return;
    const found = v.title.trim().length < 3 ? { title: "Title must be at least 3 characters long." } : {};
    setErr(found);
    setFormError(null);
    if (found.title) return;

    busy.current = true;
    try {
      await createCourse({ title: v.title.trim(), description: v.description.trim(), status: v.status }).unwrap();
      setV({ title: "", description: "", status: "draft" });
    } catch (error) {
      const r = toFormErrors(error);
      setErr(r.fieldErrors);
      setFormError(r.formError);
    } finally {
      busy.current = false;
    }
  };

  return (
    <form noValidate onSubmit={submit} className="inv-dash__panel inv-form" aria-label="Add course">
      <h2>Add a course</h2>
      {formError && <div className="inv-form__summary" role="alert"><p>{formError}</p></div>}
      <div className="inv-form__field">
        <label htmlFor="c-title">Title</label>
        <input id="c-title" className="inv-cf__control" value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} maxLength={150} aria-invalid={err.title ? "true" : undefined} />
        {err.title && <p className="inv-form__error">{err.title}</p>}
      </div>
      <div className="inv-form__field">
        <label htmlFor="c-desc">Description</label>
        <textarea id="c-desc" className="inv-cf__control" rows={3} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} maxLength={2000} />
        {err.description && <p className="inv-form__error">{err.description}</p>}
      </div>
      <div className="inv-form__field">
        <label htmlFor="c-status">Visibility</label>
        <select id="c-status" className="inv-cf__control" value={v.status} onChange={(e) => setV({ ...v, status: e.target.value })}>
          <option value="draft">Draft (hidden from students)</option>
          <option value="published">Published</option>
        </select>
      </div>
      <button type="submit" className="inv-btn inv-btn--primary" disabled={isLoading} aria-busy={isLoading}>{isLoading ? "Adding…" : "Add course"}</button>
    </form>
  );
}

export default function AdminDashboardPage() {
  usePageSeo({ title: "Admin dashboard | INVYN TECH", description: "Students, courses and enrollments.", path: ROUTES.adminDashboard }, []);

  const [tab, setTab] = useState("overview");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const students = useListStudentsQuery();
  const courses = useListCoursesQuery();
  const enrollments = useListEnrollmentsQuery();
  const [updateCourse] = useUpdateCourseMutation();

  const studentList = students.data?.users ?? [];
  const courseList = courses.data?.courses ?? [];
  const enrollList = (enrollments.data?.enrollments ?? []).filter((e) => e.status !== "cancelled");

  const perCourse = useMemo(() => enrollList.reduce((m, e) => ({ ...m, [e.courseId]: (m[e.courseId] ?? 0) + 1 }), {}), [enrollList]);
  const perStudent = useMemo(() => enrollList.reduce((m, e) => ({ ...m, [e.userId]: [...(m[e.userId] ?? []), e] }), {}), [enrollList]);
  const maxEnrolled = Math.max(1, ...Object.values(perCourse));

  const shown = studentList.filter((s) => `${s.name} ${s.email}`.toLowerCase().includes(query.trim().toLowerCase()));
  const selected = studentList.find((s) => s.id === selectedId);
  const published = courseList.filter((c) => c.status === "published").length;
  const loading = students.isLoading || courses.isLoading || enrollments.isLoading;
  const failed = students.isError || courses.isError || enrollments.isError;

  const TABS = [
    ["overview", "Overview", null],
    ["students", "Students", studentList.length],
    ["courses", "Courses", courseList.length],
  ];

  return (
    <div className="inv-page">
      <Container>
        <div className="inv-dash">
          <nav className="inv-dash__rail" aria-label="Dashboard sections">
            {TABS.map(([id, label, count]) => (
              <button key={id} type="button" className="inv-dash__tab" aria-current={tab === id ? "true" : undefined} onClick={() => setTab(id)}>
                {label}{count !== null && <span className="inv-dash__count">{count}</span>}
              </button>
            ))}
            <Link className="inv-dash__tab" to={ROUTES.adminEmployees}>Employees →</Link>
            <Link className="inv-dash__tab" to={ROUTES.adminEnquiries}>Enquiries →</Link>
          </nav>

          <main>
            <header>
              <p className="inv-eyebrow">ADMIN</p>
              <h1 className="inv-section-title">Dashboard</h1>
            </header>

            {loading && <p role="status">Loading…</p>}
            {failed && <div className="inv-admin__panel inv-admin__panel--error" role="alert"><p>Some data could not be loaded. Refresh to try again.</p></div>}

            {tab === "overview" && (
              <>
                <div className="inv-dash__tiles">
                  <div className="inv-dash__tile"><b>{studentList.length}</b><span>Students</span></div>
                  <div className="inv-dash__tile"><b>{published}</b><span>Published courses</span></div>
                  <div className="inv-dash__tile"><b>{courseList.length - published}</b><span>Drafts</span></div>
                  <div className="inv-dash__tile"><b>{enrollList.length}</b><span>Active enrollments</span></div>
                </div>
                <div className="inv-dash__split">
                  <CourseQuickAdd />
                  <section className="inv-dash__panel">
                    <h2>Most popular courses</h2>
                    {courseList.length === 0 && <p className="inv-admin__muted">No courses yet.</p>}
                    {[...courseList].sort((a, b) => (perCourse[b.id] ?? 0) - (perCourse[a.id] ?? 0)).slice(0, 5).map((c) => (
                      <div key={c.id} className="inv-dash__meta" style={{ marginBottom: ".75rem" }}>
                        <span>{c.title} <small>· {perCourse[c.id] ?? 0} enrolled</small></span>
                        <div className="inv-dash__bar"><i style={{ width: `${((perCourse[c.id] ?? 0) / maxEnrolled) * 100}%` }} /></div>
                      </div>
                    ))}
                  </section>
                </div>
              </>
            )}

            {tab === "students" && (
              <div className="inv-dash__split">
                <section className="inv-dash__panel">
                  <h2>Students</h2>
                  <label htmlFor="s-search" className="visually-hidden">Search students</label>
                  <input id="s-search" className="inv-cf__control" placeholder="Search name or email" value={query} onChange={(e) => setQuery(e.target.value)} style={{ marginBottom: ".75rem" }} />
                  <div className="inv-dash__list">
                    {shown.length === 0 && <p className="inv-admin__muted">{studentList.length ? "No matches." : "No students yet."}</p>}
                    {shown.map((s) => (
                      <button key={s.id} type="button" className="inv-dash__row" aria-pressed={selectedId === s.id} onClick={() => setSelectedId(s.id)}>
                        <span className="inv-dash__avatar" aria-hidden="true">{initials(s.name)}</span>
                        <span className="inv-dash__meta"><span>{s.name}</span><small>{s.email}</small></span>
                      </button>
                    ))}
                  </div>
                </section>
                <section className="inv-dash__panel" aria-live="polite">
                  {!selected ? (
                    <p className="inv-admin__muted">Select a student to see their courses.</p>
                  ) : (
                    <>
                      <h2>{selected.name}</h2>
                      <p className="inv-admin__muted">{selected.email} · <span className={`inv-admin__badge inv-admin__badge--${selected.status}`}>{selected.status}</span></p>
                      <h3 style={{ fontSize: "1rem" }}>Enrolled courses</h3>
                      {(perStudent[selected.id] ?? []).length === 0 && <p className="inv-admin__muted">Not enrolled in any course.</p>}
                      {(perStudent[selected.id] ?? []).map((e) => <div key={e.id} className="inv-dash__course"><span>{e.course?.title}</span><span className="inv-admin__badge inv-admin__badge--active">{e.status}</span></div>)}
                    </>
                  )}
                </section>
              </div>
            )}

            {tab === "courses" && (
              <div className="inv-dash__split">
                <CourseQuickAdd />
                <section className="inv-dash__panel">
                  <h2>All courses</h2>
                  {courseList.length === 0 && <p className="inv-admin__muted">No courses yet.</p>}
                  {courseList.map((c) => (
                    <div key={c.id} className="inv-dash__course">
                      <span className="inv-dash__meta"><span>{c.title}</span><small>{perCourse[c.id] ?? 0} enrolled · {c.status}</small></span>
                      <button type="button" className="inv-btn inv-btn--outline inv-btn--sm" onClick={() => updateCourse({ id: c.id, status: c.status === "published" ? "draft" : "published" })}>
                        {c.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                    </div>
                  ))}
                </section>
              </div>
            )}
          </main>
        </div>
      </Container>
    </div>
  );
}