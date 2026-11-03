import { formatRelative } from "../../utils/studentFormat";
import { EmptyState } from "./StudentStates";

export default function NotificationList({ items, unreadCount, onMarkRead, pendingId }) {
  return (
    <section id="notifications" className="sd-card sd-section" aria-labelledby="sd-notif-h">
      <h2 id="sd-notif-h">Notifications {unreadCount > 0 && <span className="sd-count" aria-label={`${unreadCount} unread`}>{unreadCount}</span>}</h2>
      {items.length === 0 ? (
        <EmptyState title="You are all caught up">New notifications will appear here.</EmptyState>
      ) : (
        <ul className="sd-list">
          {items.map((n) => (
            <li key={n.id} className={`sd-notif ${n.read ? "" : "is-unread"}`}>
              <div>
                <p className="sd-timeline__title">{!n.read && <span className="sd-unread-dot" aria-hidden="true" />}{n.title}</p>
                {n.body && <p className="sd-muted">{n.body}</p>}
                <p className="sd-muted"><time dateTime={n.createdAt}>{formatRelative(n.createdAt)}</time> · {n.read ? "Read" : "Unread"}</p>
              </div>
              {!n.read && (
                <button type="button" className="sd-btn sd-btn--sm" disabled={pendingId === n.id} onClick={() => onMarkRead(n.id)}>
                  {pendingId === n.id ? "Saving…" : "Mark as read"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}