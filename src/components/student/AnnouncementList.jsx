import { formatDate } from "../../utils/studentFormat";
import { EmptyState } from "./StudentStates";

export default function AnnouncementList({ items }) {
  return (
    <section id="announcements" className="sd-card sd-section" aria-labelledby="sd-ann-h">
      <h2 id="sd-ann-h">Announcements</h2>
      {items.length === 0 ? (
        <EmptyState title="No announcements">Updates from your instructors will appear here.</EmptyState>
      ) : (
        <ul className="sd-list">
          {items.map((a) => (
            <li key={a.id}>
              <p className="sd-timeline__title">{a.title}</p>
              <p className="sd-muted sd-clamp">{a.body}</p>
              <p className="sd-muted"><span className="sd-tag">{a.courseTitle || "All students"}</span> {formatDate(a.publishedAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}