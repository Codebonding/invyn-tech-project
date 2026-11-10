import { useEffect } from "react";
import { Link } from "react-router-dom";
import { isInternalLink, typeLabel } from "../../utils/announcementFormat";
import { formatDate, formatTime } from "../../utils/studentFormat";
import { serverMessage } from "../../utils/profileValidation";
import PriorityBadge from "./PriorityBadge";
import { CardSkeleton } from "../student/StudentStates";

export default function NotificationDetailDialog({ query, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const n = query.data;
  return (
    <div className="sp-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sp-dialog nt-dialog" role="dialog" aria-modal="true" aria-labelledby="nt-detail-title">
        {query.isLoading ? <div role="status" aria-label="Loading notification"><CardSkeleton lines={3} /></div>
          : query.isError ? <p className="sp-error" role="alert">{serverMessage(query.error, "We could not load this notification.")}</p>
          : (
            <>
              <h2 id="nt-detail-title">{n.title} <PriorityBadge priority={n.priority} /></h2>
              <p className="sd-muted">
                {n.announcementType ? `${typeLabel(n.announcementType)} · ` : ""}{n.courseTitle ? `${n.courseTitle} · ` : ""}
                {formatDate(n.publishedAt || n.createdAt)} {formatTime(n.publishedAt || n.createdAt)}
              </p>
              <p className="nt-message">{n.message}</p>
              {n.targetUrl && (isInternalLink(n.targetUrl)
                ? <Link className="sd-btn sd-btn--primary" to={n.targetUrl} onClick={onClose}>Open related page</Link>
                : <a className="sd-btn sd-btn--primary" href={n.targetUrl} target="_blank" rel="noopener noreferrer">Open link</a>)}
            </>)}
        <div className="sp-actions"><button type="button" className="sd-btn" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}