import { useState } from "react";
import { Link } from "react-router-dom";
import { assetUrl } from "../../utils/assetUrl";
import { getCourseRoute } from "../../utils/constant";
import { formatDate, formatRelative } from "../../utils/studentFormat";
import ProgressBar from "./ProgressBar";

const STATUS_LABEL = { ongoing: "Ongoing", completed: "Completed" };

export default function CourseCard({ course, onCompleteLesson, pendingKey }) {
  const [open, setOpen] = useState(false);
  const { progress } = course;
  const image = assetUrl(course.imageUrl);
  const panelId = `lessons-${course.courseId}`;
  const done = course.status === "completed";

  return (
    <article className="sd-card sd-course">
      <div className="sd-course__media">
        {image ? <img src={image} alt="" loading="lazy" /> : <span className="sd-course__ph" aria-hidden="true">{course.title.slice(0, 1)}</span>}
        <span className={`sd-badge sd-badge--${done ? "ok" : "info"} sd-course__status`}>{STATUS_LABEL[course.status]}</span>
      </div>

      <div className="sd-course__body">
        <h3 className="sd-course__title">{course.title}</h3>
        {course.description && <p className="sd-muted sd-clamp">{course.description}</p>}
        <p className="sd-course__meta">
          {course.instructor && <span>Instructor: {course.instructor}</span>}
          <span>Enrolled {formatDate(course.enrolledAt)}</span>
          <span>{course.lastAccessedAt ? `Last activity ${formatRelative(course.lastAccessedAt)}` : "No lessons completed yet"}</span>
        </p>

        <ProgressBar value={progress.percentage} label={`${course.title} progress`} />
        <p className="sd-muted sd-course__counts">
          {progress.totalLessons > 0
            ? `${progress.completedLessons}/${progress.totalLessons} lessons · ${progress.completedModules}/${progress.totalModules} modules`
            : "Lesson tracking is not available for this course yet"}
        </p>

        <div className="sd-course__actions">
          {progress.totalLessons > 0 && (
            <button type="button" className="sd-btn sd-btn--primary" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((v) => !v)}>
              {done ? "Review lessons" : "Continue learning"}
            </button>
          )}
          <Link className="sd-btn sd-btn--outline" to={getCourseRoute(course.slug)}>View course</Link>
        </div>

        {open && (
          <div id={panelId} className="sd-lessons">
            {progress.modules.map((m) => (
              <div key={m.index} className="sd-lessons__module">
                <p className="sd-lessons__title">{m.title} <span className="sd-muted">({m.completedLessons}/{m.totalLessons})</span></p>
                <ul>
                  {m.lessons.map((l) => {
                    const key = `${course.courseId}:${m.index}:${l.index}`;
                    return (
                      <li key={l.index} className={l.completed ? "is-done" : ""}>
                        <span>{l.completed ? "✓ " : ""}{l.title}</span>
                        {!l.completed && !done && (
                          <button type="button" className="sd-btn sd-btn--sm" disabled={pendingKey === key} onClick={() => onCompleteLesson({ courseId: course.courseId, moduleIndex: m.index, lessonIndex: l.index })}>
                            {pendingKey === key ? "Saving…" : "Mark complete"}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}