import { useState } from "react";
import { openMaterialFile } from "../../../utils/materialFile";
import { EmptyState } from "../StudentStates";

const TYPE_LABEL = { pdf: "PDF", notes: "Notes", video: "Video", link: "Link" };
const size = (bytes) => (bytes ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : "");

export default function MaterialList({ data, onError }) {
  const [busyId, setBusyId] = useState(null);
  const [openNotes, setOpenNotes] = useState(null);

  if (data.locked) {
    return <EmptyState title="Materials open when the course starts">This course starts on {data.availableOn}.</EmptyState>;
  }
  if (data.items.length === 0) {
    return <EmptyState title="No materials yet">Your instructor has not published any materials for this course.</EmptyState>;
  }

  const open = async (m) => {
    setBusyId(m.id);
    try {
      await openMaterialFile(m);
    } catch {
      onError("Could not open this file. You may no longer have access to it.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ul className="sd-list mc-materials">
      {data.items.map((m) => (
        <li key={m.id}>
          <div className="mc-material__head">
            <div>
              <p className="sd-timeline__title"><span className="sd-tag">{TYPE_LABEL[m.type]}</span> {m.title}</p>
              {m.description && <p className="sd-muted">{m.description}</p>}
              {m.type === "pdf" && <p className="sd-muted">{m.fileName} {size(m.sizeBytes) && `· ${size(m.sizeBytes)}`}</p>}
            </div>
            {m.type === "pdf" && (
              <button type="button" className="sd-btn sd-btn--sm" disabled={busyId === m.id} onClick={() => open(m)}>
                {busyId === m.id ? "Opening…" : m.allowDownload ? "Download" : "View"}
              </button>
            )}
            {(m.type === "link" || m.type === "video") && (
              <a className="sd-btn sd-btn--sm" href={m.url} target="_blank" rel="noopener noreferrer">{m.type === "video" ? "Watch" : "Open"}<span className="visually-hidden"> {m.title}</span></a>
            )}
            {m.type === "notes" && (
              <button type="button" className="sd-btn sd-btn--sm" aria-expanded={openNotes === m.id} onClick={() => setOpenNotes(openNotes === m.id ? null : m.id)}>
                {openNotes === m.id ? "Hide notes" : "Read notes"}
              </button>
            )}
          </div>
          {m.type === "notes" && openNotes === m.id && <p className="mc-notes">{m.content}</p>}
        </li>
      ))}
    </ul>
  );
}