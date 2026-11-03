import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../utils/constant";
import CourseCard from "./CourseCard";
import { EmptyState } from "./StudentStates";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "ongoing", label: "Ongoing" },
  { id: "completed", label: "Completed" },
];

export default function MyCourses({ courses, onCompleteLesson, pendingKey }) {
  const [filter, setFilter] = useState("all");
  const counts = useMemo(() => ({
    all: courses.length,
    ongoing: courses.filter((c) => c.status === "ongoing").length,
    completed: courses.filter((c) => c.status === "completed").length,
  }), [courses]);
  const visible = filter === "all" ? courses : courses.filter((c) => c.status === filter);

  return (
    <section id="courses" className="sd-section" aria-labelledby="sd-courses-h">
      <div className="sd-section__head">
        <h2 id="sd-courses-h">My courses</h2>
        <div className="sd-filters" role="group" aria-label="Filter courses">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" className={`sd-chip ${filter === f.id ? "is-active" : ""}`} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label} <span>{counts[f.id]}</span>
            </button>
          ))}
        </div>
      </div>

      {courses.length === 0 ? (
        <EmptyState title="You have not enrolled in any course yet" action={<Link className="sd-btn sd-btn--primary" to={ROUTES.courses}>Browse courses</Link>}>
          Courses you enrol in will appear here with your progress.
        </EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState title={`No ${filter} courses`}>Try a different filter.</EmptyState>
      ) : (
        <div className="sd-courses">
          {visible.map((c) => <CourseCard key={c.enrollmentId} course={c} onCompleteLesson={onCompleteLesson} pendingKey={pendingKey} />)}
        </div>
      )}
    </section>
  );
}