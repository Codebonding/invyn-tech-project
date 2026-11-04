import { useEffect, useRef } from "react";

export default function ConfirmDialog({ open, title, message, confirmLabel = "Delete", busy = false, onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    cancelRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape" && !busy) onCancel(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div className="sp-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onCancel(); }}>
      <div className="sp-dialog" role="dialog" aria-modal="true" aria-labelledby="sp-dialog-title" aria-describedby="sp-dialog-text">
        <h2 id="sp-dialog-title">{title}</h2>
        <p id="sp-dialog-text" className="sd-muted">{message}</p>
        <div className="sp-actions">
          <button type="button" ref={cancelRef} className="sd-btn" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="button" className="sd-btn sd-btn--primary sp-danger" onClick={onConfirm} disabled={busy}>{busy ? "Deleting…" : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}