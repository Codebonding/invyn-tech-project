import { audienceText, statusLabel, typeLabel } from "../../utils/announcementFormat";
import { formatDate, formatTime } from "../../utils/studentFormat";
import PriorityBadge from "./PriorityBadge";

const TONE = { published: "ok", scheduled: "info", draft: "info", archived: "warn" };

/** Buttons appear only where the server says the caller may act (`canEdit`). The API enforces the same rules. */
export default function AnnouncementsTable({ items, busyId, onEdit, onPublish, onArchive, onDelete, onStats }) {
  return (
    <div className="lm-table-wrap">
      <table className="lm-table">
        <caption className="visually-hidden">Announcements</caption>
        <thead><tr><th scope="col">Title</th><th scope="col">Audience</th><th scope="col">Status</th><th scope="col">Date</th><th scope="col">Read</th><th scope="col">Actions</th></tr></thead>
        <tbody>
          {items.map((a) => {
            const when = a.status === "scheduled" ? a.scheduledAt : a.publishedAt || a.createdAt;
            const busy = busyId === a.id;
            return (
              <tr key={a.id}>
                <td data-label="Title"><strong>{a.title}</strong> <PriorityBadge priority={a.priority} /><span className="sd-tag">{typeLabel(a.announcementType)}</span>{a.expired && <span className="sd-tag">Expired</span>}</td>
                <td data-label="Audience">{audienceText(a)}</td>
                <td data-label="Status"><span className={`sd-badge nt-status nt-status--${TONE[a.status]}`}>{statusLabel(a.status)}</span>{a.status === "published" && !a.delivered && <span className="sd-muted"> · delivering</span>}</td>
                <td data-label="Date">{a.status === "scheduled" ? "Goes out " : ""}{formatDate(when)} <span className="sd-muted">{formatTime(when)}</span></td>
                <td data-label="Read">{a.status === "published" ? `${a.readCount} of ${a.recipientCount}` : "—"}</td>
                <td data-label="Actions">
                  <div className="lm-actions">
                    {a.status === "published" && <button type="button" className="sd-btn sd-btn--sm" onClick={() => onStats(a)} aria-label={`Statistics for ${a.title}`}>Statistics</button>}
                    {a.canEdit && <button type="button" className="sd-btn sd-btn--sm" onClick={() => onEdit(a)} aria-label={`Edit ${a.title}`}>Edit</button>}
                    {a.canEdit && (a.status === "draft" || a.status === "scheduled") && <button type="button" className="sd-btn sd-btn--sm sd-btn--primary" disabled={busy} onClick={() => onPublish(a)} aria-label={`Publish ${a.title}`}>Publish</button>}
                    {a.canEdit && <button type="button" className="sd-btn sd-btn--sm" disabled={busy} onClick={() => onArchive(a)} aria-label={`Archive ${a.title}`}>Archive</button>}
                    {a.canEdit && (a.status === "draft" || a.status === "scheduled") && <button type="button" className="sd-btn sd-btn--sm lm-danger" disabled={busy} onClick={() => onDelete(a)} aria-label={`Delete ${a.title}`}>Delete</button>}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}