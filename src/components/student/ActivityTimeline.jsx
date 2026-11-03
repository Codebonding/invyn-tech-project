import { formatRelative } from "../../utils/studentFormat";
import { EmptyState } from "./StudentStates";

const LABEL = { enrolled: "Enrolled", lesson_completed: "Lesson", module_completed: "Module", course_completed: "Course" };

export default function ActivityTimeline({ items }) {
  return (
    <section id="activity" className="sd-card sd-section" aria-labelledby="sd-activity-h">
      <h2 id="sd-activity-h">Recent activity</h2>
      {items.length === 0 ? (
        <EmptyState title="No activity yet">Enrol in a course or complete a lesson to see it here.</EmptyState>
      ) : (
        <ol className="sd-timeline">
          {items.map((a) => (
            <li key={a.id}>
              <span className={`sd-dot sd-dot--${a.type}`} aria-hidden="true" />
              <div>
                <p className="sd-timeline__title">{a.title}</p>
                <p className="sd-muted"><span className="sd-tag">{LABEL[a.type] || "Activity"}</span> {a.courseTitle} · <time dateTime={a.at}>{formatRelative(a.at)}</time></p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}