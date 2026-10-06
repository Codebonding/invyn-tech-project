export default function CourseMiniCard({ course, active, hidden, onSelect }) {
  return (
    <button
      type="button"
      className={`inv-mini ${active ? "is-active" : ""}`}
      onClick={() => onSelect(course.id)}
      aria-current={active ? "true" : undefined}
      aria-label={`Show ${course.title}`}
      tabIndex={hidden ? -1 : undefined}
    >
      <span className="inv-mini__cat">{course.category}</span>
      <span className="inv-mini__title">{course.title}</span>
      <span className="inv-mini__meta">{course.duration}</span>
    </button>
  );
}