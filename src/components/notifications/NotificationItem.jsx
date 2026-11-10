import { Link } from "react-router-dom";
import { categoryLabel, isInternalLink } from "../../utils/announcementFormat";
import { formatDate, formatRelative } from "../../utils/studentFormat";
import PriorityBadge from "./PriorityBadge";

/** One notification. Unread items have a dot AND the word "Unread" (never colour alone). Text only: nothing is rendered as HTML. */
export default function NotificationItem({ item, onRead, onOpen, busy }) {
  return (
    <li className={`nt-item ${item.read ? "" : "is-unread"}`}>
      <div className="nt-item__main">
        <p className="nt-item__title">
          {!item.read && <span className="sd-unread-dot" aria-hidden="true" />}
          {item.title}
          <PriorityBadge priority={item.priority} />
        </p>
        {item.body && <p className="sd-muted nt-item__body">{item.body}</p>}
        <p className="sd-muted">
          <span className="sd-tag">{categoryLabel(item.category)}</span>
          {item.courseTitle && <span className="sd-tag">{item.courseTitle}</span>}
          <time dateTime={item.publishedAt || item.createdAt} title={formatDate(item.publishedAt || item.createdAt)}>{formatRelative(item.publishedAt || item.createdAt)}</time>
          {" · "}{item.read ? "Read" : "Unread"}
        </p>
      </div>
      <div className="nt-item__actions">
        <button type="button" className="sd-btn sd-btn--sm" onClick={() => onOpen(item)} aria-label={`View details: ${item.title}`}>View</button>
        {item.targetUrl && (isInternalLink(item.targetUrl)
          ? <Link className="sd-btn sd-btn--sm" to={item.targetUrl}>Open<span className="visually-hidden"> {item.title}</span></Link>
          : <a className="sd-btn sd-btn--sm" href={item.targetUrl} target="_blank" rel="noopener noreferrer">Open<span className="visually-hidden"> {item.title}</span></a>)}
        {!item.read && <button type="button" className="sd-btn sd-btn--sm" disabled={busy} onClick={() => onRead(item.id)} aria-label={`Mark as read: ${item.title}`}>{busy ? "Saving…" : "Mark as read"}</button>}
      </div>
    </li>
  );
}