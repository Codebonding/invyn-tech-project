import { formatSessionDay, formatTime } from "../../utils/studentFormat";
import { EmptyState } from "./StudentStates";

export default function SessionList({ items }) {
  return (
    <section id="sessions" className="sd-card sd-section" aria-labelledby="sd-sessions-h">
      <h2 id="sd-sessions-h">Upcoming classes</h2>
      {items.length === 0 ? (
        <EmptyState title="No upcoming sessions">Sessions scheduled for your courses will appear here.</EmptyState>
      ) : (
        <ul className="sd-list">
          {items.map((s) => (
            <li key={s.id} className="sd-session">
              <div className="sd-session__date"><b>{formatSessionDay(s.startsAt)}</b><span>{formatTime(s.startsAt)} – {formatTime(s.endsAt)}</span></div>
              <div className="sd-session__main">
                <p className="sd-timeline__title">{s.title}</p>
                <p className="sd-muted">{s.courseTitle}{s.instructor ? ` · ${s.instructor}` : ""}</p>
              </div>
              <div className="sd-session__side">
                <span className={`sd-badge sd-badge--${s.status === "live" ? "ok" : s.status === "cancelled" ? "warn" : "info"}`}>{s.status}</span>
                {s.meetingUrl && <a className="sd-btn sd-btn--sm" href={s.meetingUrl} target="_blank" rel="noopener noreferrer">Join<span className="visually-hidden"> {s.title}</span></a>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}