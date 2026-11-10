import { useEffect } from "react";
import { serverMessage } from "../../utils/profileValidation";
import { formatDate, formatTime } from "../../utils/studentFormat";
import ProgressBar from "../student/ProgressBar";
import { CardSkeleton } from "../student/StudentStates";

export default function AnnouncementStatsDialog({ title, query, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const s = query.data;
  return (
    <div className="sp-overlay">
      <div className="sp-dialog" role="dialog" aria-modal="true" aria-labelledby="as-title">
        <h2 id="as-title">Statistics: {title}</h2>
        {query.isLoading ? <div role="status" aria-label="Loading statistics"><CardSkeleton lines={3} /></div>
          : query.isError ? <p className="sp-error" role="alert">{serverMessage(query.error, "We could not load the statistics.")}</p>
          : (
            <>
              <dl className="fe-rows">
                <div><dt>Recipients</dt><dd>{s.recipients}</dd></div><div><dt>Read</dt><dd>{s.read}</dd></div><div><dt>Unread</dt><dd>{s.unread}</dd></div>
                <div><dt>Published</dt><dd>{s.publishedAt ? `${formatDate(s.publishedAt)} ${formatTime(s.publishedAt)}` : "—"}</dd></div>
              </dl>
              <ProgressBar value={s.readRate} label="Read rate" />
              {s.deliveryPending && <p className="sd-muted" role="status">Delivery to all recipients is still in progress.</p>}
            </>)}
        <div className="sp-actions"><button type="button" className="sd-btn" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}