import ProgressBar from "../student/ProgressBar";

export default function CourseAttendanceCard({ course }) {
  return (
    <article className="sd-card at-course" aria-label={course.title}>
      <h3>{course.title}</h3>
      <ProgressBar value={course.percentage} label={`${course.title} attendance`} />
      <dl className="mc-facts">
        <div><dt>Sessions held</dt><dd>{course.totalSessions}</dd></div>
        <div><dt>Not marked yet</dt><dd>{course.unmarked}</dd></div>
        <div><dt>Present</dt><dd>{course.present}</dd></div>
        <div><dt>Absent</dt><dd>{course.absent}</dd></div>
        <div><dt>Leave</dt><dd>{course.leave}</dd></div>
      </dl>
      {course.eligibleSessions === 0 && <p className="sd-muted">No attendance counted yet.</p>}
    </article>
  );
}