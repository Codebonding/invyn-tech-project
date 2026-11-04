import { useState } from "react";
import { EDUCATION_LEVELS, labelFor } from "../../../utils/profileOptions";
import { EmptyState } from "../StudentStates";
import ConfirmDialog from "./ConfirmDialog";
import EducationForm from "./EducationForm";

export default function EducationCard({ items, onCreate, onUpdate, onDelete }) {
  const [mode, setMode] = useState(null); // null | "add" | the record being edited
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const confirmDelete = async () => {
    setDeleteBusy(true);
    try {
      await onDelete(deleting.id);
    } catch {
      /* the page shows an error toast */
    } finally {
      setDeleteBusy(false);
      setDeleting(null);
    }
  };

  return (
    <section id="education" className="sd-card sp-section" aria-labelledby="education-heading">
      <div className="sp-section__head">
        <h2 id="education-heading">Educational qualifications</h2>
        {mode === null && <button type="button" className="sd-btn sd-btn--sm" onClick={() => setMode("add")}>Add qualification</button>}
      </div>

      {mode !== null && (
        <EducationForm
          key={mode === "add" ? "add" : mode.id}
          record={mode === "add" ? null : mode}
          onSubmit={mode === "add" ? onCreate : (values) => onUpdate(mode.id, values)}
          onCancel={() => setMode(null)}
        />
      )}

      {items.length === 0 && mode === null ? (
        <EmptyState title="No qualifications added yet">Add your education to keep your profile complete.</EmptyState>
      ) : (
        <ul className="sp-edu">
          {items.map((r) => (
            <li key={r.id}>
              <div>
                <p className="sp-edu__title">
                  {r.degreeName}{r.specialization ? ` · ${r.specialization}` : ""}
                  {r.isCurrent && <span className="sd-badge sd-badge--ok">Currently studying</span>}
                </p>
                <p className="sd-muted">
                  {[r.institution, r.university, r.department].filter(Boolean).join(" · ")}
                </p>
                <p className="sd-muted">
                  {labelFor(EDUCATION_LEVELS, r.level)} · {r.startYear} – {r.isCurrent ? "Present" : r.completionYear}
                  {r.grade ? ` · ${r.grade}` : ""}
                </p>
              </div>
              <div className="sp-edu__actions">
                <button type="button" className="sd-btn sd-btn--sm" onClick={() => setMode(r)} aria-label={`Edit ${r.degreeName}`}>Edit</button>
                <button type="button" className="sd-btn sd-btn--sm" onClick={() => setDeleting(r)} aria-label={`Delete ${r.degreeName}`}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this qualification?"
        message={deleting ? `“${deleting.degreeName}” will be removed from your profile. This cannot be undone.` : ""}
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </section>
  );
}