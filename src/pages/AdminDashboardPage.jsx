import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/common/Container";
import usePageSeo from "../hooks/usePageSeo";
import {
  useDeleteCourseMutation,
  useListCoursesQuery,
  useListEnrollmentsQuery,
  useListStudentsQuery,
  useUpdateCourseMutation,
} from "../services/dashboardApi";
import CourseForm from "../components/admin/CourseForm";
import CourseRow from "../components/admin/CourseRow";
import { ROUTES } from "../utils/constant";
import "../styles/course-pages.css";
import "../styles/admin.css";
import "../styles/dashboard.css";

const initials = (name) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function AdminDashboardPage() {
  usePageSeo(
    {
      title: "Admin dashboard | INVYN TECH",
      description: "Students, courses and enrollments.",
      path: ROUTES.adminDashboard,
    },
    []
  );

  const [tab, setTab] = useState("overview");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [courseError, setCourseError] = useState(null);

  const students = useListStudentsQuery();
  const courses = useListCoursesQuery();
  const enrollments = useListEnrollmentsQuery();

  const [updateCourse] = useUpdateCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();

  const studentList = students.data?.users ?? [];
  const courseList = courses.data?.courses ?? [];

  const enrollList = (enrollments.data?.enrollments ?? []).filter(
    (enrollment) => enrollment.status !== "cancelled"
  );

  const perCourse = useMemo(
    () =>
      enrollList.reduce((counts, enrollment) => {
        counts[enrollment.courseId] =
          (counts[enrollment.courseId] ?? 0) + 1;
        return counts;
      }, {}),
    [enrollList]
  );

  const perStudent = useMemo(
    () =>
      enrollList.reduce((enrollmentsByStudent, enrollment) => {
        const userId = enrollment.userId;

        if (!enrollmentsByStudent[userId]) {
          enrollmentsByStudent[userId] = [];
        }

        enrollmentsByStudent[userId].push(enrollment);
        return enrollmentsByStudent;
      }, {}),
    [enrollList]
  );

  const maxEnrolled = Math.max(1, ...Object.values(perCourse));

  const shown = studentList.filter((student) =>
    `${student.name} ${student.email}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  );

  const selected = studentList.find(
    (student) => student.id === selectedId
  );

  const published = courseList.filter(
    (course) => course.status === "published"
  ).length;

  const loading =
    students.isLoading ||
    courses.isLoading ||
    enrollments.isLoading;

  const failed =
    students.isError ||
    courses.isError ||
    enrollments.isError;

  const onDeleteCourse = async (course) => {
    const enrolledStudents = perCourse[course.id]
      ? ` ${perCourse[course.id]} student(s) are enrolled in it.`
      : "";

    const confirmed = window.confirm(
      `Delete “${course.title}” permanently?${enrolledStudents} This cannot be undone.`
    );

    if (!confirmed) return;

    setCourseError(null);

    try {
      await deleteCourse(course.id).unwrap();

      if (editing?.id === course.id) {
        setEditing(null);
      }
    } catch (error) {
      setCourseError(
        error?.data?.message ?? "The course could not be deleted."
      );
    }
  };

  const TABS = [
    ["overview", "Overview", null],
    ["students", "Students", studentList.length],
    ["courses", "Courses", courseList.length],
  ];

  return (
    <div className="inv-page">
      <Container>
        <div className="inv-dash">
          <nav
            className="inv-dash__rail"
            aria-label="Dashboard sections"
          >
            {TABS.map(([id, label, count]) => (
              <button
                key={id}
                type="button"
                className="inv-dash__tab"
                aria-current={tab === id ? "true" : undefined}
                onClick={() => setTab(id)}
              >
                {label}
                {count !== null && (
                  <span className="inv-dash__count">{count}</span>
                )}
              </button>
            ))}

            <Link
              className="inv-dash__tab"
              to={ROUTES.adminEmployees}
            >
              Employees →
            </Link>

            <Link
              className="inv-dash__tab"
              to={ROUTES.adminEnquiries}
            >
              Enquiries →
            </Link>
          </nav>

          <main>
            <header>
              <p className="inv-eyebrow">ADMIN</p>
              <h1 className="inv-section-title">Dashboard</h1>
            </header>

            {loading && <p role="status">Loading…</p>}

            {failed && (
              <div
                className="inv-admin__panel inv-admin__panel--error"
                role="alert"
              >
                <p>
                  Some data could not be loaded. Refresh to try again.
                </p>
              </div>
            )}

            {tab === "overview" && (
              <>
                <div className="inv-dash__tiles">
                  <div className="inv-dash__tile">
                    <b>{studentList.length}</b>
                    <span>Students</span>
                  </div>

                  <div className="inv-dash__tile">
                    <b>{published}</b>
                    <span>Published courses</span>
                  </div>

                  <div className="inv-dash__tile">
                    <b>{courseList.length - published}</b>
                    <span>Drafts</span>
                  </div>

                  <div className="inv-dash__tile">
                    <b>{enrollList.length}</b>
                    <span>Active enrollments</span>
                  </div>
                </div>

                <div className="inv-dash__split">
                  <section className="inv-dash__panel">
                    <h2>Courses</h2>
                    <p className="inv-admin__muted">
                      Create, edit, publish or delete courses and
                      everything on their pages.
                    </p>
                    <button
                      type="button"
                      className="inv-btn inv-btn--primary"
                      onClick={() => setTab("courses")}
                    >
                      Manage courses
                    </button>
                  </section>

                  <section className="inv-dash__panel">
                    <h2>Most popular courses</h2>

                    {courseList.length === 0 && (
                      <p className="inv-admin__muted">
                        No courses yet.
                      </p>
                    )}

                    {[...courseList]
                      .sort(
                        (a, b) =>
                          (perCourse[b.id] ?? 0) -
                          (perCourse[a.id] ?? 0)
                      )
                      .slice(0, 5)
                      .map((course) => (
                        <div
                          key={course.id}
                          className="inv-dash__meta"
                          style={{ marginBottom: ".75rem" }}
                        >
                          <span>
                            {course.title}{" "}
                            <small>
                              · {perCourse[course.id] ?? 0} enrolled
                            </small>
                          </span>

                          <div className="inv-dash__bar">
                            <i
                              style={{
                                width: `${
                                  ((perCourse[course.id] ?? 0) /
                                    maxEnrolled) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
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

                  <label
                    htmlFor="s-search"
                    className="visually-hidden"
                  >
                    Search students
                  </label>

                  <input
                    id="s-search"
                    className="inv-cf__control"
                    placeholder="Search name or email"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    style={{ marginBottom: ".75rem" }}
                  />

                  <div className="inv-dash__list">
                    {shown.length === 0 && (
                      <p className="inv-admin__muted">
                        {studentList.length
                          ? "No matches."
                          : "No students yet."}
                      </p>
                    )}

                    {shown.map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        className="inv-dash__row"
                        aria-pressed={selectedId === student.id}
                        onClick={() => setSelectedId(student.id)}
                      >
                        <span
                          className="inv-dash__avatar"
                          aria-hidden="true"
                        >
                          {initials(student.name)}
                        </span>

                        <span className="inv-dash__meta">
                          <span>{student.name}</span>
                          <small>{student.email}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                <section
                  className="inv-dash__panel"
                  aria-live="polite"
                >
                  {!selected ? (
                    <p className="inv-admin__muted">
                      Select a student to see their courses.
                    </p>
                  ) : (
                    <>
                      <h2>{selected.name}</h2>

                      <p className="inv-admin__muted">
                        {selected.email} ·{" "}
                        <span
                          className={`inv-admin__badge inv-admin__badge--${selected.status}`}
                        >
                          {selected.status}
                        </span>
                      </p>

                      <h3 style={{ fontSize: "1rem" }}>
                        Enrolled courses
                      </h3>

                      {(perStudent[selected.id] ?? []).length === 0 && (
                        <p className="inv-admin__muted">
                          Not enrolled in any course.
                        </p>
                      )}

                      {(perStudent[selected.id] ?? []).map(
                        (enrollment) => (
                          <div
                            key={enrollment.id}
                            className="inv-dash__course"
                          >
                            <span>{enrollment.course?.title}</span>
                            <span className="inv-admin__badge inv-admin__badge--active">
                              {enrollment.status}
                            </span>
                          </div>
                        )
                      )}
                    </>
                  )}
                </section>
              </div>
            )}

            {tab === "courses" && (
              <div className="inv-dash__split">
                <CourseForm
                  key={editing?.id ?? "new"}
                  course={editing}
                  onCancel={() => setEditing(null)}
                />

                <section className="inv-dash__panel">
                  <h2>All courses</h2>

                  {courseError && (
                    <p className="inv-form__error" role="alert">
                      {courseError}
                    </p>
                  )}

                  {courseList.length === 0 && (
                    <p className="inv-admin__muted">
                      No courses yet.
                    </p>
                  )}

                  {courseList.map((course) => (
                    <CourseRow
                      key={course.id}
                      course={course}
                      enrolled={perCourse[course.id] ?? 0}
                      onTogglePublish={(item) =>
                        updateCourse({
                          id: item.id,
                          status:
                            item.status === "published"
                              ? "draft"
                              : "published",
                        })
                      }
                      onEdit={(item) => {
                        setEditing(item);
                        window.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        });
                      }}
                      onDelete={onDeleteCourse}
                    />
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