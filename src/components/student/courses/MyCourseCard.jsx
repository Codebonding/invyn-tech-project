import { Link } from "react-router-dom";
import { assetUrl } from "../../../utils/assetUrl";
import { getCourseRoute, getStudentCourseRoute } from "../../../utils/constant";
import { formatDate, formatRelative } from "../../../utils/studentFormat";
import ProgressBar from "../ProgressBar";

const STATUS = {
  ongoing: { label: "Ongoing", tone: "info" },
  completed: { label: "Completed", tone: "ok" },
  upcoming: { label: "Upcoming", tone: "warn" },
};

export default function MyCourseCard({ course }) {
  const { progress, status } = course;
  const image = assetUrl(course.imageUrl);
  const learnRoute = getStudentCourseRoute(course.courseId);

  const facts = [
    ["Duration", course.duration],
    ["Mode", course.mode],
    ["Starts", course.startDate ? formatDate(course.startDate) : "To be announced"],
    ["Ends", course.endDate ? formatDate(course.endDate) : "—"],
    ["Enrolled", formatDate(course.enrolledAt)],
    ...(course.instructor ? [["Instructor", course.instructor]] : []),
  ];

  return (
    <article className="sd-card sd-course mc-card" aria-label={course.title}>
      <div className="sd-course__media">
        {image ? <img src={image} alt="" loading="lazy" /> : <span className="sd-course__ph" aria-hidden="true">{course.title.slice(0, 1)}</span>}
        <span className={`sd-badge sd-badge--${STATUS[status].tone} sd-course__status`}>{STATUS[status].label}</span>
      </div>

      <div className="sd-course__body">
        <p className="mc-category">{course.category}</p>
        <h3 className="sd-course__title">{course.title}</h3>
        {course.description && <p className="sd-muted sd-clamp">{course.description}</p>}

        <dl className="mc-facts">
          {facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          <div><dt>Enrollment</dt><dd className="mc-cap">{course.enrollmentStatus}</dd></div>
        </dl>

        {status === "upcoming" ? (
          <p className="sd-muted mc-note">Starts on {formatDate(course.startDate)}. Learning opens on that date.</p>
        ) : (
          <>
            <ProgressBar value={progress.percentage} label={`${course.title} progress`} />
            <p className="sd-muted">
              {progress.totalLessons > 0
                ? `${progress.completedLessons}/${progress.totalLessons} lessons · ${progress.completedModules}/${progress.totalModules} modules`
                : "No lessons available yet"}
            </p>
            <p className="sd-muted">
              {status === "completed" && course.completedAt
                ? `Completed on ${formatDate(course.completedAt)}`
                : course.lastAccessedAt
                  ? `Last activity ${formatRelative(course.lastAccessedAt)}`
                  : "No learning activity yet"}
            </p>
          </>
        )}

        <div className="sd-course__actions">
          {status === "ongoing" && <Link className="sd-btn sd-btn--primary" to={learnRoute}>Continue learning</Link>}
          {status === "completed" && <Link className="sd-btn sd-btn--primary" to={learnRoute}>Review course</Link>}
          <Link className="sd-btn sd-btn--outline" to={getCourseRoute(course.slug)}>View details</Link>
          {status !== "upcoming" && (
            <Link className="sd-btn" to={{ pathname: learnRoute, hash: "#materials" }}>
              Learning materials{course.materialsCount > 0 ? ` (${course.materialsCount})` : ""}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}