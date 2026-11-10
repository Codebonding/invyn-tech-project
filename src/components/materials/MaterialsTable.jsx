import { MATERIAL_TYPES, formatBytes } from "../../utils/materialValidation";
import { formatDate } from "../../utils/studentFormat";

const TYPE_LABEL = Object.fromEntries(MATERIAL_TYPES);
const TONE = { published: "ok", draft: "info", archived: "warn" };

/** Which actions to offer. The server enforces the same rules; this only hides buttons that would be refused. */
export function actionsFor(material, user) {
  const adminUpload = material.uploadedBy?.role === "admin";
  return { canDelete: user.role === "admin" || !adminUpload };
}

export default function MaterialsTable({ items, user, busyId, onEdit, onStatus, onDelete, onOpen }) {
  return (
    <div className="lm-table-wrap">
      <table className="lm-table">
        <caption className="visually-hidden">Learning materials</caption>
        <thead>
          <tr>
            <th scope="col">Material</th><th scope="col">Course</th><th scope="col">Module</th><th scope="col">Uploaded by</th>
            <th scope="col">Size</th><th scope="col">Status</th><th scope="col">Created</th><th scope="col">Download</th><th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((m) => {
            const { canDelete } = actionsFor(m, user);
            const busy = busyId === m.id;
            return (
              <tr key={m.id}>
                <td data-label="Material">
                  <strong>{m.title}</strong>
                  <span className="sd-tag">{TYPE_LABEL[m.type]}</span>
                  {m.hasFile && m.fileName && <span className="sd-muted"> {m.fileName}</span>}
                </td>
                <td data-label="Course">{m.courseTitle}</td>
                <td data-label="Module">{m.moduleTitle || "—"}</td>
                <td data-label="Uploaded by">
                  {m.uploadedBy?.name || "—"}
                  {m.updatedBy && m.updatedBy.id !== m.uploadedBy?.id && <span className="sd-muted"> · edited by {m.updatedBy.name}</span>}
                </td>
                <td data-label="Size">{m.sizeBytes ? formatBytes(m.sizeBytes) : "—"}</td>
                <td data-label="Status"><span className={`sd-badge sd-badge--${TONE[m.status]}`}>{m.status}</span></td>
                <td data-label="Created">{formatDate(m.createdAt)}</td>
                <td data-label="Download">{m.hasFile ? (m.allowDownload ? "Allowed" : "View only") : "—"}</td>
                <td data-label="Actions">
                  <div className="lm-actions">
                    {m.hasFile && <button type="button" className="sd-btn sd-btn--sm" onClick={() => onOpen(m)} aria-label={`Open ${m.title}`}>Open</button>}
                    <button type="button" className="sd-btn sd-btn--sm" onClick={() => onEdit(m)} aria-label={`Edit ${m.title}`}>Edit</button>
                    {m.status === "draft" && <button type="button" className="sd-btn sd-btn--sm sd-btn--primary" disabled={busy} onClick={() => onStatus(m, "published")} aria-label={`Publish ${m.title}`}>Publish</button>}
                    {m.status === "published" && <button type="button" className="sd-btn sd-btn--sm" disabled={busy} onClick={() => onStatus(m, "draft")} aria-label={`Unpublish ${m.title}`}>Unpublish</button>}
                    {m.status !== "archived" && <button type="button" className="sd-btn sd-btn--sm" disabled={busy} onClick={() => onStatus(m, "archived")} aria-label={`Archive ${m.title}`}>Archive</button>}
                    {m.status === "archived" && <button type="button" className="sd-btn sd-btn--sm" disabled={busy} onClick={() => onStatus(m, "draft")} aria-label={`Restore ${m.title}`}>Restore</button>}
                    {canDelete && <button type="button" className="sd-btn sd-btn--sm lm-danger" disabled={busy} onClick={() => onDelete(m)} aria-label={`Delete ${m.title}`}>Delete</button>}
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